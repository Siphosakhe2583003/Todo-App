# Start from the official Go base image
FROM golang:1.23.5 as builder

# Set the working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go binary
RUN go build -o server .

# Use a lightweight final image
FROM debian:bullseye-slim

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/server .

# Expose port (optional, but good practice)
EXPOSE 8080

# Set environment variable so Go knows to run in production mode
ENV GIN_MODE=release

# Command to run the executable
CMD ["./server"]
