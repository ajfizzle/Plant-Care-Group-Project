require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const mongoose = require("mongoose");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const stripeRoutes = require("./routes/stripe");

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection with options for compatibility
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/plantDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Middleware for parsing requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Stripe routes for payment handling
app.use("/api/stripe", stripeRoutes);

// Apollo Server Setup
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => authMiddleware({ req }),
    introspection: true, // Enable introspection for GraphQL tools
    csrfPrevention: true, // CSRF protection
    cache: "bounded", // Optimized caching
  });

  await server.start();
  server.applyMiddleware({ app });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  // Catch-all route to serve React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  // Start listening
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(
      `GraphQL available at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

// Start the server with error handling
startApolloServer().catch((err) =>
  console.error("Error starting server:", err)
);
