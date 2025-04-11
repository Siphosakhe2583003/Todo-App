# Stage 1: Build the Go binary
FROM golang:1.23.5 AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go binary
RUN go build -o server .

# Stage 2: Use a modern slim image with newer GLIBC
FROM debian:bookworm-slim

WORKDIR /app

# Install required libraries (just in case)
RUN apt-get update && apt-get install -y ca-certificates && apt-get clean

# Copy the compiled Go binary
COPY --from=builder /app/server .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variable for production mode (optional)
ENV GIN_MODE=release

# Run the app
CMD ["./server"]
