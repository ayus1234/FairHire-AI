# Use official lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variable for the port
ENV PORT 8080

# Command to run the application
# We use uvicorn to run the FastAPI app 'main:app'
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
