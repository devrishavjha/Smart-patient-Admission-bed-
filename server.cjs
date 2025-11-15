const { Server } = require("socket.io");
const net = require("net");

const PORT = 8080;

function startServer() {
  const io = new Server(PORT, {
    cors: {
      origin: "*",
    },
  });

  console.log("Socket.IO server running on ws://localhost:8080");

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Receive seriousness from a bed
    socket.on("update_seriousness", (data) => {
      console.log("Forwarding seriousness:", data);

      // Broadcast to ALL dashboards
      io.emit("dashboard_update", data);
    });
  });
}

function checkPortAndStart() {
  const tester = net
    .createServer()
    .once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log("8080 busy → clearing...");

        const { exec } = require("child_process");
        exec(
          `for /f "tokens=5" %a in ('netstat -ano ^| findstr :8080') do taskkill /PID %a /F`,
          () => {
            console.log("Port cleared. Restarting...");
            setTimeout(startServer, 500);
          }
        );
      }
    })
    .once("listening", () => {
      tester.close();
      startServer();
    })
    .listen(PORT);
}

checkPortAndStart();
