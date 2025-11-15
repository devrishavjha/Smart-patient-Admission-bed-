import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://smart-patient-admission-bed.onrender.com");

export default function Dashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Patient ${i + 1}`,
      age: 50 + i,
      sex: i % 2 === 0 ? "Male" : "Female",
      status: "Low",
      level: 0,
    }))
  );

  // 🔊 audio + per-patient alert tracking
  const [audioEnabled, setAudioEnabled] = useState(false);
  const alertSound = useRef(new Audio("/alert.mp3")); // make sure alert.mp3 is in public folder
  const lastPlayedLevel = useRef({}); // { [patientId]: lastLevel }

  // Enable audio after user interaction
  const enableAudio = () => {
    alertSound.current.play().catch(() => {});
    setAudioEnabled(true);
  };

  useEffect(() => {
    socket.on("dashboard_update", (data) => {
      const { bedId, seriousness } = data;

      // Initialize if undefined
      if (lastPlayedLevel.current[bedId] === undefined) {
        lastPlayedLevel.current[bedId] = 0;
      }

      // 🔊 play sound ONCE whenever seriousness becomes 4 for each patient
      if (audioEnabled && seriousness === 4 && lastPlayedLevel.current[bedId] !== 4) {
        alertSound.current.play().catch(() => {});
        lastPlayedLevel.current[bedId] = 4;
      }

      // Reset lastPlayedLevel when risk falls back
      if (seriousness < 4) {
        lastPlayedLevel.current[bedId] = seriousness;
      }

      setPatients((prev) =>
        prev.map((p) =>
          p.id === Number(bedId)
            ? {
                ...p,
                level: seriousness,
                status: mapStatus(seriousness),
              }
            : p
        )
      );
    });

    return () => socket.off("dashboard_update");
  }, [audioEnabled]);

  const mapStatus = (n) => {
    switch (n) {
      case 0:
        return "Low";
      case 1:
        return "Moderate";
      case 2:
        return "High";
      case 3:
        return "Critical";
      case 4:
        return "Emergency";
      default:
        return "Low";
    }
  };

  const getStatusColor = (status, level) => {
    if (level === 3 || level === 4) return "bg-red-600 animate-pulse";

    switch (status) {
      case "Low":
        return "bg-green-400";
      case "Moderate":
        return "bg-yellow-400";
      case "High":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-gray-800 mb-12 text-center"
      >
        Patient Monitoring Dashboard
      </motion.h1>

      {/* Button to enable audio alerts */}
      {!audioEnabled && (
        <div className="text-center mb-8">
          <button
            onClick={enableAudio}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all"
          >
            Enable Alerts
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {patients.map((patient) => (
          <motion.div
            key={patient.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-xl rounded-2xl p-6 relative cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => navigate(`/beds/${patient.id}`)}
          >
            <div
              className={`absolute top-4 right-4 w-4 h-4 rounded-full ${getStatusColor(
                patient.status,
                patient.level
              )}`}
            ></div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {patient.name}
            </h2>
            <div className="text-gray-600 mb-1">Age: {patient.age}</div>
            <div className="text-gray-600 mb-3">Sex: {patient.sex}</div>

            <div className="mt-4">
              <span className="text-gray-500 text-sm font-semibold">
                Current Risk Level:
              </span>
              <div
                className={`mt-1 font-bold text-white px-3 py-1 rounded-full inline-block ${getStatusColor(
                  patient.status,
                  patient.level
                )}`}
              >
                {patient.status}
              </div>
            </div>

            <div className="mt-6 text-gray-400 text-sm">
              Click to open detailed bed simulator
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
