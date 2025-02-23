const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pzf14.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db("managementDB").collection("users");
    const taskCollection = client.db("taskDB").collection("tasks");

    app.post('/users', async(req, res) =>{
        const user = req.body;
        const query = {email: user.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser){
            return res.send({message: 'user already exist'})
        } 
        const result = await userCollection.insertOne(user);
         res.send(result);
    })

    app.post("/task", async(req, res) =>{
      const task = req.body;
      task.timestamp = new Date();
      const result = await taskCollection.insertOne(task);
      res.send(result);
  })

  app.get("/tasks", async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.send(tasks);
  });

  app.delete("/task/:id", async (req, res) => {
    const taskId = req.params.id;
    const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });
    res.send(result);
  });

  app.put("/task/:id", async (req, res) => {
    const taskId = req.params.id;
    const updatedTask = req.body;
  
    try {
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
  
      if (result.modifiedCount === 1) {
        res.send({ message: "Task updated successfully" });
      } else {
        res.status(404).send({ message: "Task not found or no changes made" });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  app.get("/tasks/todo", async (req, res) => {
      const todoTasks = await taskCollection.find({ category: "To-Do" }).toArray();
      res.send(todoTasks);
  });

  app.get("/tasks/inprogress", async (req, res) => {
      const inProgressTasks = await taskCollection.find({ category: "In Progress" }).toArray();
      res.send(inProgressTasks);
  });

  app.get("/tasks/done", async (req, res) => {
      const doneTasks = await taskCollection.find({ category: "Done" }).toArray();
      res.send(doneTasks);
  });
  

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Task Management is waiting")
})

app.listen(port, () =>{
    console.log(`Task Management is setting on port${port}`)
})