package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID    `json:"id,omitempty" bson:"id,omitempty"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

var collection *mongo.Collection

func main() {
	fmt.Println("Hello")

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Fail Loading .env", err)
	}

	MONGODB_URI := os.Getenv("MONGODB_URI")
	clientOptions := options.Client().ApplyURI(MONGODB_URI) // sets up the client
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), nil)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MONGODB")

	collection = client.Database("golang_db").Collection("todos")

	app := fiber.New()

	app.Get("todos/", getTodos)
	app.Post("todos/", postTodos)
	// app.Put("todos/:id", putTodos)
	// app.Delete("todos/:id", deleteTodos)

	port := os.Getenv("PORT")
	log.Fatal(app.Listen("0.0.0.0" + port))

	func getTodos(c *fiber.Ctx) error {
		var todos []Todo

		cursor, err := collection.Find(context.Background(), bson.M{})

		if err != nil{
			return err
		}

		defer cursor.Close(context.Background())

		for cursor.Next(context.Background()) {
			var todo Todo
			if err := cursor.Decode(&todo); err != nil {
				return err
			}
			todos = append(todos, todo)
		}
		
		return c.JSON(todos)
	}
	func postTodos(c *fiber.Ctx) error {
		todo := new(Todo)

		if err := c.BodyParser(todo); err != nil {
			return err
		}

		if todo.Body == ""{
			return c.Status(400).JSON(fiber.Map{"err": "Todo body cannot be empty"})
		}

		insert, err := collection.InsertOne(context.Background(), todo)
		if err != nil {
			return err
		}
			
		todo.ID = insert.InsertedID.(primitive.ObjectID)

		return c.Status(201).JSON(todo)
	}
	// func putTodos(c *fiber.Ctx) error {}
	// func deleteTodos(c *fiber.Ctx) error {}


	
		
}
