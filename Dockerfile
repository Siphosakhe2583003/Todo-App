FROM golang:1.23.5-alpine

ENV PORT=8080

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files first (for caching dependencies)
COPY go.* ./
RUN go mod download

# Copy the entire project into the container
COPY . .

EXPOSE 8080

# Run the main application
CMD ["go", "run", "main.go"]

