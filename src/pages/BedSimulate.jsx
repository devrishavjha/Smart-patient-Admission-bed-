import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://smart-patient-admission-bed.onrender.com");

export default function BedSimulate() {
  const { id } = useParams();

  const [values, setValues] = useState({
    HR: 80,
    Systolic: 120,
    Diastolic: 80,
    SpO2: 98,
    Temp: 98.0,
    Movement: 0,
  });

  const debounceTimer = useRef(null);

  const updateValue = (key, val) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const sendData = () => {
    const tempC = ((values.Temp - 32) * 5) / 9;

    const payload = {
      HR: values.HR,
      Systolic: values.Systolic,
      Diastolic: values.Diastolic,
      SpO2: values.SpO2,
      Temp: parseFloat(tempC.toFixed(1)),
      Movement: values.Movement
    };

    axios
      .post("https://modrl-for.onrender.com/predict", payload)
      .then((res) => {
        const seriousness = res.data.Seriousness;

        socket.emit("update_seriousness", {
          bedId: id,
          seriousness,
        });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(sendData, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [values]);

  const sliders = [
    { key: "HR", label: "Heart Rate (BPM)", min: 40, max: 200, step: 1 },
    { key: "Systolic", label: "Systolic BP (mmHg)", min: 80, max: 200, step: 1 },
    { key: "Diastolic", label: "Diastolic BP (mmHg)", min: 50, max: 140, step: 1 },
    { key: "SpO2", label: "Oxygen Saturation (%)", min: 70, max: 100, step: 1 },
    { key: "Temp", label: "Body Temperature (°F)", min: 95, max: 108, step: 0.1 },
    { key: "Movement", label: "Movement", min: 0, max: 3, step: 1 },
  ];

  // OPEN SENSOR SIMULATION LINK
  const openSensorPage = () => {
    window.open("https://simulation-nu-ten.vercel.app/", "_blank");
  };

  // CONSULT AI DOCTOR BUTTON
  const openConsultAI = () => {
    window.open("https://doctoraiheart.streamlit.app/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Patient Bed {id} Simulator
        </h1>

        {/* CONSULT AI DOCTOR BUTTON — text instead of heart */}
        <button
          onClick={openConsultAI}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all"
          title="Consult AI Doctor"
        >
          Consult AI Doctor
        </button>
      </div>

      <div className="w-full max-w-md bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 space-y-6">
        {sliders.map(({ key, label, min, max, step }) => (
          <div key={key}>
            <div className="flex justify-between font-medium text-gray-700 mb-1">
              <span>{label}</span>
              <span>{values[key]}</span>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values[key]}
              onChange={(e) =>
                updateValue(
                  key,
                  key === "Temp"
                    ? parseFloat(e.target.value)
                    : parseInt(e.target.value)
                )
              }
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* VIEW SENSOR DATA BUTTON */}
      <button
        onClick={openSensorPage}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all"
      >
        View Sensor 
      </button>
    </div>
  );
}
