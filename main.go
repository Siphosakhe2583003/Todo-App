package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gofiber/fiber/v2"
	"google.golang.org/api/option"
)

var (
	firebaseApp *firebase.App
	firestoreDB *firestore.Client
	authClient  *auth.Client
)

// Initialize Firebase
func initFirebase() {
	ctx := context.Background()
	sa := option.WithCredentialsFile("serviceAccountKey.json")

	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalf("Error initializing Firebase: %v", err)
	}

	// Initialize Firestore
	firestoreDB, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error initializing Firestore: %v", err)
	}

	// Initialize Firebase Auth
	authClient, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error initializing Auth: %v", err)
	}

	firebaseApp = app
	fmt.Println("✅ Firebase initialized successfully")
}

// Middleware: Verify Firebase Token
func authMiddleware(c *fiber.Ctx) error {
	token := c.Get("Authorization")
	if token == "" {
		return c.Status(401).SendString("Unauthorized: No token provided")
	}

	// Extract token (Bearer format)
	token = token[len("Bearer "):]

	// Verify token
	ctx := context.Background()
	decodedToken, err := authClient.VerifyIDToken(ctx, token)
	if err != nil {
		return c.Status(401).SendString("Unauthorized: Invalid token")
	}

	// Store UID in context
	c.Locals("uid", decodedToken.UID)
	return c.Next()
}

// Get Board by ID
func getBoardByID(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	// Fetch board
	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Board not found")
	}

	// // Ensure user owns the board
	// if doc.Data()["ownerId"] != uid {
	// 	return c.Status(403).SendString("Forbidden: You don't own this board")
	// }

	// Convert Firestore data to JSON
	boardData := doc.Data()
	boardData["id"] = doc.Ref.ID

	return c.JSON(boardData)
}

// Update Board Name
func updateBoardName(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	// Parse JSON request
	var requestBody struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(c.Body(), &requestBody); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	// Fetch board
	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Board not found")
	}

	// Update board name
	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "name", Value: requestBody.Name},
	})
	if err != nil {
		return c.Status(500).SendString("Error updating board name")
	}

	return c.JSON(fiber.Map{"message": "Board name updated successfully"})
}

// Get Boards for Logged-in User
func getBoards(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	ctx := context.Background()

	query := firestoreDB.Collection("users").Doc(uid).Collection("boards")
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return c.Status(500).SendString("Error fetching boards")
	}

	// Convert Firestore data to JSON
	var boards []map[string]interface{}
	for _, doc := range docs {
		data := doc.Data()
		data["id"] = doc.Ref.ID
		boards = append(boards, data)
	}

	return c.JSON(boards)
}

// Create a New Board
func createBoard(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	ctx := context.Background()

	// Parse JSON request
	var board struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(c.Body(), &board); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	// Save to Firestore
	docRef, _, err := firestoreDB.Collection("users").Doc(uid).Collection("boards").Add(ctx, map[string]interface{}{
		"name":      board.Name,
		"createdAt": time.Now(),
	})
	if err != nil {
		return c.Status(500).SendString("Error creating board")
	}

	return c.JSON(fiber.Map{"id": docRef.ID, "message": "Board created successfully"})
}

// Delete Board
func deleteBoard(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	// Get the board
	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Board not found")
	}

	// Delete board
	_, err = docRef.Delete(ctx)
	if err != nil {
		return c.Status(500).SendString("Error deleting board")
	}

	return c.JSON(fiber.Map{"message": "Board deleted successfully"})
}

func addTask(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()
	// Parse JSON request
	var task struct {
		Content string `json:"content"`
		Type    string `json:"type"` // "Todo", "Doing", "Done"
	}
	if err := json.Unmarshal(c.Body(), &task); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	if task.Content == "" {
		return c.Status(400).SendString("Task content cannot is empty")
	}
	// Save to Firestore
	docRef, _, err := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID).Collection("tasks").Add(ctx, map[string]interface{}{
		"content":   task.Content,
		"type":      task.Type,
		"createdAt": time.Now(),
	})
	if err != nil {
		return c.Status(500).SendString("Error creating task")
	}
	return c.JSON(fiber.Map{"id": docRef.ID, "message": "Task added successfully"})
}

func getTasks(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	id := c.Params("id")
	ctx := context.Background()

	query := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(id).Collection("tasks")
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return c.Status(500).SendString("Error fetching tasks")
	}
	var tasks []map[string]interface{}
	for _, doc := range docs {
		data := doc.Data()
		data["id"] = doc.Ref.ID
		tasks = append(tasks, data)
	}

	return c.JSON(tasks)
}

func editTaskContent(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	id := c.Params("id")
	bid := c.Params("bid")
	ctx := context.Background()

	var task struct {
		Content string `json:"content"`
	}

	if err := json.Unmarshal(c.Body(), &task); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(bid).Collection("tasks").Doc(id)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Task not found")
	}

	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "content", Value: task.Content},
	})
	if err != nil {
		return c.Status(500).SendString("Error updating task")
	}

	return c.JSON(fiber.Map{"message": "Task updated successfully"})
}

func editTaskType(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	id := c.Params("id")
	bid := c.Params("bid")
	ctx := context.Background()
	var task struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(c.Body(), &task); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}
	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(bid).Collection("tasks").Doc(id)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Task not found")
	}
	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "type", Value: task.Type},
	})
	if err != nil {
		return c.Status(500).SendString("Error updating task")
	}
	return c.JSON(fiber.Map{"message": "Task updated successfully"})
}

func deleteTask(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	id := c.Params("id")
	bid := c.Params("bid")
	ctx := context.Background()
	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(bid).Collection("tasks").Doc(id)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Task not found")
	}
	_, err = docRef.Delete(ctx)
	if err != nil {
		return c.Status(500).SendString("Error deleting task")
	}
	return c.JSON(fiber.Map{"message": "Task deleted successfully"})
}

func main() {
	// Initialize Firebase
	initFirebase()

	// Create Fiber app
	app := fiber.New()

	// Routes (Protected by authMiddleware
	api := app.Group("/api", authMiddleware)
	api.Get("/boards", getBoards)           // Get all boards
	api.Post("/boards", createBoard)        // Create new board
	api.Delete("/boards/:id", deleteBoard)  // Delete a board
	api.Get("/boards/:id", getBoardByID)    // Get board by ID
	api.Put("/boards/:id", updateBoardName) // Update board name

	// Routes for adding tasks
	api.Post("/boards/:id/tasks", addTask)
	api.Get("/boards/:id/tasks", getTasks)
	api.Put("/boards/:bid/tasks/:id", editTaskContent)
	api.Put("/boards/:bid/tasks/:id/type", editTaskType)
	api.Delete("/boards/:bid/tasks/:id", deleteTask)

	// Start server
	log.Fatal(app.Listen(":3000"))
}
