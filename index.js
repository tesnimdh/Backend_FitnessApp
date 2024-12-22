require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const socketIO = require('./socket.io');
const setupSwagger = require('./swagger.js');


const app = express();
setupSwagger(app);
app.use(express.json());
const port = 3000;
const server = http.createServer(app);

app.use(express.json());

app.use(cors())

const io = socketIO(server);

//db connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to database"))
  .catch((err) => console.error("Could not connect to database", err));


//Routes
const exerciceRoutes = require("./routes/exercice");
const programRoutes = require("./routes/program");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const adminRoutes = require("./routes/admin");
const setRoutes = require("./routes/set");

app.use("/exercices", exerciceRoutes);
app.use("/programs", programRoutes);
app.use("/users",userRoutes);
app.use("/messages", messageRoutes); 
app.use("/admins", adminRoutes);  
app.use("/sets", setRoutes);  


app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));






// app.get("/", (req, res) => {
//     res.send("Fitness App");
// });

// server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});