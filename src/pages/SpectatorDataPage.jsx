import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserDataContext";
import { postUser } from "../api/client";

export default function SpectatorDataPage() {
  const { userId, userData } = useUser();
  const [cleared, setCleared] = useState(false);

  if (!userId) {
    return (
      <div className="text-white p-6">
        <p>No user selected.</p>
        <Link to="/" className="underline">
          Go back
        </Link>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-white p-6">
        <p>Loading...</p>
      </div>
    );
  }

  // -------------------------------------------------------
  // 🔥 CLEAR SPECTATOR DATA (only these fields)
  // -------------------------------------------------------

  const clearSpectatorData = async () => {
    try {
      await postUser(userId, {
        _clearSpectator: true, // merge logic uses this flag
        first_name: "",
        last_name: "",
        phone_number: "",
        birthday: "",
        days_alive: 0,
        address: "",
        // keep these untouched
        note_name: userData.note_name,
        screenshot_base64: userData.screenshot_base64,
        command: userData.command
      });

      setCleared(true);
      setTimeout(() => setCleared(false), 1500);
    } catch (err) {
      console.error("Failed to clear spectator data:", err);
    }
  };

  // -------------------------------------------------------
  // 🧱 Address formatting
  // -------------------------------------------------------

  const addressList = Array.isArray(userData.address)
    ? userData.address
    : typeof userData.address === "string" && userData.address.trim() !== ""
    ? userData.address.split("\n")
    : [];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-10">
        <Link to="/" className="text-sm text-gray-300 hover:text-white">
          ← Home
        </Link>

        {cleared && (
          <div className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            Data cleared
          </div>
        )}

        <button
          onClick={clearSpectatorData}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl"
        >
          Clear
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Spectator Data</h1>

      {/* FIRST NAME */}
      <div className="mb-4">
        <label className="text-xs text-gray-400">FIRST NAME</label>
        <input
          readOnly
          value={userData.first_name || ""}
          className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-xl mt-1"
        />
      </div>

      {/* LAST NAME */}
      <div className="mb-4">
        <label className="text-xs text-gray-400">LAST NAME</label>
        <input
          readOnly
          value={userData.last_name || ""}
          className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-xl mt-1"
        />
      </div>

      {/* PHONE NUMBER */}
      <div className="mb-4">
        <label className="text-xs text-gray-400">PHONE NUMBER</label>
        <input
          readOnly
          value={userData.phone_number || ""}
          className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-xl mt-1"
        />
      </div>

      {/* BIRTHDAY */}
      <div className="mb-4">
        <label className="text-xs text-gray-400">BIRTHDAY</label>
        <input
          readOnly
          value={userData.birthday || ""}
          className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-xl mt-1"
        />
      </div>

      {/* DAYS ALIVE */}
      <div className="mb-4">
        <label className="text-xs text-gray-400">DAYS ALIVE</label>
        <input
          readOnly
          value={userData.days_alive || 0}
          className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-xl mt-1"
        />
      </div>

      {/* ADDRESSES */}
      <div className="mt-6">
        <label className="text-xs text-gray-400">ADDRESSES</label>

        {addressList.length === 0 ? (
          <p className="text-gray-500 mt-2 text-sm">No address found</p>
        ) : (
          addressList.map((line, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] px-4 py-3 rounded-xl mt-2 text-gray-200"
            >
              <span className="text-xs text-gray-500 mr-2">{i + 1}.</span>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
