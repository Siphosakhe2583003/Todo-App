FROM golang:1.23.5-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files first (for caching dependencies)
COPY go.* ./
RUN go mod download

# Install Air for live reloading
RUN go install github.com/air-verse/air@latest

# Copy the entire project into the container
COPY . .

# Expose the port your Go app runs on (modify if needed)
EXPOSE 3000

# Command to run Air with the config file
CMD ["air", "-c", ".air.toml"]

