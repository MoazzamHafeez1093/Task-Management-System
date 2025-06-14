import React, { useState } from "react";

const AuthForm = ({ type = "login", onSubmit, loading, error }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "register") {
      onSubmit(username, email, password);
    } else {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4 dark:bg-gray-800 dark:text-gray-100 dark:shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        {type === "login" ? "Login" : "Register"}
      </h2>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {type === "register" && (
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>
      )}
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500"
        disabled={loading}
      >
        {loading ? "Loading..." : type === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
};

export default AuthForm; 