FROM golang:1.23.5-alpine

ENV PORT=8080
ENV HOST=0.0.0.0

RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and download deps
COPY go.* ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the Go app
RUN go build -o main .

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./main"]
