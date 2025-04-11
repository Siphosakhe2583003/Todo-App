package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

var (
	firebaseApp *firebase.App
	firestoreDB *firestore.Client
	authClient  *auth.Client
	app         *firebase.App
	err         error
	keylocation string
)

func toJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	log.Print(string(b))
	return string(b)
}

func initFirebase() {
	ctx := context.Background()
	env := os.Getenv("ENV")

	var opt option.ClientOption

	if env == "prod" {
		cred := map[string]interface{}{
			"type":                        "service_account",
			"project_id":                  os.Getenv("FIREBASE_PROJECT_ID"),
			"private_key_id":              os.Getenv("FIREBASE_PRIVATE_KEY_ID"),
			"private_key":                 os.Getenv("FIREBASE_PRIVATE_KEY"),
			"client_email":                os.Getenv("FIREBASE_CLIENT_EMAIL"),
			"client_id":                   os.Getenv("FIREBASE_CLIENT_ID"),
			"auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
			"token_uri":                   "https://oauth2.googleapis.com/token",
			"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			"client_x509_cert_url":        os.Getenv("FIREBASE_CLIENT_CERT_URL"),
			"universe_domain":             "googleapis.com",
		}
		log.Print(cred)
		opt = option.WithCredentialsJSON([]byte(toJSON(cred)))
	} else {
		opt = option.WithCredentialsFile("serviceAccountKey.json") // local dev
	}

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	firestoreDB, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error initializing Firestore: %v", err)
	}

	authClient, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error initializing Auth: %v", err)
	}

	firebaseApp = app
	fmt.Println("✅ Firebase initialized successfully")
}

func authHandler(c *fiber.Ctx) error {
	var request struct {
		IDToken string `json:"idToken"`
	}

	if err := json.Unmarshal(c.Body(), &request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid Request"})
	}

	ctx := context.Background()

	token, err := authClient.VerifyIDToken(ctx, request.IDToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid ID"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "authToken",
		Value:    request.IDToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: "None",
	})

	return c.JSON(fiber.Map{"message": "Login successful", "uid": token.UID})
}

func authMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("authToken")

	if token == "" {
		return c.Status(401).SendString("Unauthorized: No token provided")
	}

	ctx := context.Background()
	decodedToken, err := authClient.VerifyIDToken(ctx, token)
	if err != nil {
		return c.Status(401).SendString("Unauthorized: Invalid token")
	}

	c.Locals("uid", decodedToken.UID)
	return c.Next()
}

func getBoardByID(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Board not found")
	}

	// Convert Firestore data to JSON
	boardData := doc.Data()
	boardData["id"] = doc.Ref.ID

	// Fetch tasks
	tasksCol := docRef.Collection("tasks")
	tasksDocs, err := tasksCol.Documents(ctx).GetAll()
	if err != nil {
		return c.Status(500).SendString("Error fetching tasks")
	}

	// Initialize the tasks map
	tasks := make(map[string]interface{})

	for _, taskDoc := range tasksDocs {
		taskData := taskDoc.Data()       // Get task data as a map
		taskData["id"] = taskDoc.Ref.ID  // Add the task ID
		tasks[taskDoc.Ref.ID] = taskData // Store modified task data
	}

	// Attach tasks to board data
	boardData["tasks"] = tasks

	// Update Board Last Modified Time
	err = updatesLastAccessTime(uid, boardID, ctx)
	if err != nil {
		return c.Status(500).SendString("Failed to update last modified time")
	}

	return c.JSON(boardData)
}

// Update Board Name
func updateBoardName(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

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
		{Path: "updatedAt", Value: time.Now()},
	})
	if err != nil {
		return c.Status(500).SendString("Error updating board name")
	}

	return c.JSON(fiber.Map{"message": "Board name updated successfully"})
}

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

func getLastUpdatedBoard(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	ctx := context.Background()

	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards")
	docs, err := docRef.Documents(ctx).GetAll()
	if err != nil {
		return c.Status(500).SendString("Error fetching Boards")
	}

	var board map[string]interface{}
	currTime := time.Now()
	var maxDiff int64 = math.MaxInt64

	for _, doc := range docs {
		data := doc.Data()
		docTime := data["updatedAt"].(time.Time)
		diff := currTime.Sub(docTime).Microseconds()
		if diff <= maxDiff {
			board = data
			board["id"] = doc.Ref.ID
			maxDiff = diff
		}
	}
	return c.JSON(board)
}

// Create a New Board
func createBoard(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	ctx := context.Background()

	var board struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(c.Body(), &board); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	docRef, _, err := firestoreDB.Collection("users").Doc(uid).Collection("boards").Add(ctx, map[string]interface{}{
		"name":      board.Name,
		"createdAt": time.Now(),
		"updatedAt": time.Now(),
	})
	if err != nil {
		return c.Status(500).SendString("Error creating board")
	}

	return c.JSON(fiber.Map{"id": docRef.ID, "message": "Board created successfully"})
}

func deleteBoard(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	docRef := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)
	_, err := docRef.Get(ctx)
	if err != nil {
		return c.Status(404).SendString("Board not found")
	}

	err = deleteSubcollections(ctx, docRef)
	if err != nil {
		return c.Status(404).SendString("Deleting Failed")
	}

	_, err = docRef.Delete(ctx)
	if err != nil {
		return c.Status(500).SendString("Error deleting board")
	}

	return c.JSON(fiber.Map{"message": "Board deleted successfully"})
}

func deleteSubcollections(ctx context.Context, docRef *firestore.DocumentRef) error {
	collections, err := docRef.Collections(ctx).GetAll()
	if err != nil {
		return err
	}

	for _, col := range collections {
		docs, err := col.Documents(ctx).GetAll()
		if err != nil {
			return err
		}

		for _, doc := range docs {
			// Recursively delete subcollections before deleting the document
			if err := deleteSubcollections(ctx, doc.Ref); err != nil {
				return err
			}

			_, err := doc.Ref.Delete(ctx)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func updatesLastAccessTime(uid string, boardID string, ctx context.Context) error {
	query := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID)

	_, err := query.Update(ctx, []firestore.Update{
		{Path: "updatedAt", Value: time.Now()},
	})

	return err
}

func addTask(c *fiber.Ctx) error {
	uid := c.Locals("uid").(string)
	boardID := c.Params("id")
	ctx := context.Background()

	var task struct {
		Content  string `json:"content"`
		Type     string `json:"type"`     // "Todo", "Doing", "Completed"
		Priority string `json:"priority"` // "Low", "Medium", "High"
	}
	if err := json.Unmarshal(c.Body(), &task); err != nil {
		return c.Status(400).SendString("Invalid request body")
	}

	if task.Content == "" {
		return c.Status(400).SendString("Task content cannot is empty")
	}
	// Update Board Last Modified Time
	err := updatesLastAccessTime(uid, boardID, ctx)
	if err != nil {
		return c.Status(500).SendString("Board not found")
	}

	formatedTask := map[string]interface{}{
		"content":   task.Content,
		"type":      task.Type,
		"priority":  task.Priority,
		"createdAt": time.Now(),
	}
	docRef, _, err := firestoreDB.Collection("users").Doc(uid).Collection("boards").Doc(boardID).Collection("tasks").Add(ctx, formatedTask)
	if err != nil {
		return c.Status(500).SendString("Error creating task")
	}
	return c.JSON(fiber.Map{"id": docRef.ID, "task": formatedTask, "message": "Task added successfully"})
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
		Content  string `json:"content"`
		Priority string `json:"priority"`
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
		{Path: "priority", Value: task.Priority},
	})

	if err != nil {
		return c.Status(500).SendString("Error updating task")
	}
	// Update Board Last Modified Time
	err = updatesLastAccessTime(uid, bid, ctx)
	if err != nil {
		return c.Status(500).SendString("Board not found")
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
	// Update Board Last Modified Time
	err = updatesLastAccessTime(uid, bid, ctx)
	if err != nil {
		return c.Status(500).SendString("Board not found")
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

	// Update Board Last Modified Time
	err = updatesLastAccessTime(uid, bid, ctx)
	if err != nil {
		return c.Status(500).SendString("Board not found")
	}
	return c.JSON(fiber.Map{"message": "Task deleted successfully"})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Print("Error loading .env file")
	}
	log.Print("Starting server...")
	initFirebase()

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8080"
	}
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://go-do.web.app, http://localhost:5173, http://192.168.0.139:5173/, http://localhost:5000",
		AllowMethods:     "GET,POST,DELETE,PUT,OPTIONS,PATCH",
		AllowHeaders:     "Content-Type, Authorization",
		AllowCredentials: true,
	}))
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
		return c.Next()
	})

	// Login and session cookie
	app.Post("/auth", authHandler)

	// Routes for board management
	api := app.Group("/api", authMiddleware)
	api.Get("/", getLastUpdatedBoard)
	api.Get("/boards", getBoards)
	api.Post("/boards", createBoard)
	api.Delete("/boards/:id", deleteBoard)
	api.Get("/boards/:id", getBoardByID) // must get the full board including its tasks
	api.Put("/boards/:id", updateBoardName)

	// Routes for adding tasks
	api.Post("/boards/:id/tasks", addTask)
	api.Get("/boards/:id/tasks", getTasks)
	api.Put("/boards/:bid/tasks/:id", editTaskContent)
	api.Put("/boards/:bid/tasks/:id/type", editTaskType)
	api.Delete("/boards/:bid/tasks/:id", deleteTask)

	// Start server
	log.Fatal(app.Listen("0.0.0.0:" + PORT))
}
