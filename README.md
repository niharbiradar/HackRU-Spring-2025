# Campus Rideshare Backend

This is the backend for the **Campus Rideshare** application, built with **Flask**, **MongoDB**, and **Docker**. It provides APIs for managing users, rides, payments, and more.

---

## Table of Contents

1. [Features](#features)
2. [Technologies](#technologies)
3. [Setup](#setup)
   - [Prerequisites](#prerequisites)
   - [Local Development](#local-development)
   - [Docker Setup](#docker-setup)
4. [API Documentation](#api-documentation)
5. [Environment Variables](#environment-variables)
6. [Contributing](#contributing)
7. [License](#license)

---

## Features

- **User Management**: Create, read, update, and delete users.
- **Ride Management**: Manage rides, including start/end locations, ride times, and status.
- **Payments**: Track payment status for rides.
- **Ratings & Reviews**: Allow users to rate and review rides.
- **Swagger UI**: Interactive API documentation.

---

## Technologies

- **Flask**: Python web framework.
- **MongoDB**: NoSQL database for storing application data.
- **Flask-RESTX**: For building RESTful APIs and generating Swagger documentation.
- **Docker**: Containerization for easy deployment and development.
- **Python**: Primary programming language.

---

## Setup

### Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Python 3.9**: [Install Python](https://www.python.org/downloads/)

---

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/campus-rideshare-backend.git
   cd backend
   ```

2. **Create a `.env` file** in the `backend` directory:

   ```plaintext
   # backend/.env
   MONGODB_USERNAME=your_mongodb_username
   MONGODB_PASSWORD=your_mongodb_password
   MONGODB_CLUSTER=your_mongodb_cluster
   ```

3. **Install dependencies**:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run the Flask app**:

   ```bash
   python app/main.py
   ```

5. Access the app at: `http://localhost:8000`

---

### Docker Setup

1. **Build and run the Docker containers**:

   ```bash
   docker-compose up --build
   ```

2. Access the app at: `http://localhost:8000`

3. Access the MongoDB instance at: `mongodb://localhost:27017`

---

## API Documentation

The API documentation is available via **Swagger UI**. After starting the app, visit:

```
http://localhost:8000/docs
```

### Example Endpoints

- **Create a User**:
  - **POST** `/api/users/`
  - Request Body:
    ```json
    {
      "user_id": "123",
      "email": "test@example.com",
      "name": "Test User",
      "user_type": "rider",
      "university_email_verified": true,
      "profile_picture": "http://example.com/profile.jpg",
      "emergency_contacts": [
        {
          "name": "Emergency Contact",
          "phone": "123-456-7890"
        }
      ]
    }
    ```

- **Get a User**:
  - **GET** `/api/users/<user_id>`

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

Please follow the [code of conduct](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Questions?

For any questions or issues, please open an issue on GitHub or contact the maintainers.

---
