import { useState } from "react";

export default function MiddleReceiverComponent() {
  const [handle, setHandle] = useState("@");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [buttonText, setButtonText] = useState("Create Handle");
  const [isCreating, setIsCreating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleCreateHandle = async () => {
    setIsCreating(true);
    setIsError(false);
    setIsSuccess(false);
    setButtonText("Creating handle...");

    try {
      const response = await fetch("/api/createHandle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle: handle.slice(1), // Remove @ symbol for API
          address: address,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        if (response.status === 409) {
          setButtonText(data.error || "Handle or email already exists");
        } else {
          setButtonText(data.error || "Error creating handle");
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        setButtonText("Create Handle");
        setIsCreating(false);
        setIsError(false);
        return;
      }

      // Success!
      setIsSuccess(true);
      setButtonText("Handle created!");
      
      // Generate the shareable URL
      const currentUrl = window.location.origin + window.location.pathname;
      const shareableUrl = `${currentUrl}?handle=${encodeURIComponent(handle)}`;
      setGeneratedUrl(shareableUrl);
      
    } catch (error) {
      setIsError(true);
      setButtonText("Error creating handle");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setButtonText("Create Handle");
      setIsCreating(false);
      setIsError(false);
    }
  };

  const isButtonDisabled = 
    handle === "@" || 
    handle === "" || 
    address === "" || 
    email === "" || 
    isCreating ||
    isSuccess;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      width: "100%", 
      position: "absolute",
      top: "60%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 5,
      padding: "20px"
    }}>
      <div style={{ 
        width: "600px", 
        maxWidth: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "30px",
        border: "1px solid rgb(230, 230, 230)"
      }}>
        {!isSuccess ? (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Handle (username)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith("@")) {
                    setHandle(value);
                  } else {
                    setHandle("@" + value);
                  }
                }}
                placeholder="@yourhandle"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  color: "#333"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Mailing Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State 12345"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  color: "#333"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  color: "#333"
                }}
              />
            </div>

            <button
              onClick={handleCreateHandle}
              disabled={isButtonDisabled}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isError ? "#dc2626" : (isButtonDisabled ? "#ccc" : "#0070f3"),
                color: "white",
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              {buttonText}
            </button>
          </>
        ) : (
          <div style={{
            border: "2px solid #16a34a",
            borderRadius: "12px",
            padding: "30px",
            textAlign: "center",
            backgroundColor: "#f0fdf4"
          }}>
            <h2 style={{ color: "#16a34a", marginBottom: "20px", fontSize: "24px" }}>
              ✓ Handle Created Successfully!
            </h2>
            <p style={{ marginBottom: "20px", fontSize: "16px", color: "#374151" }}>
              Share this link to receive stickers:
            </p>
            <div style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              {generatedUrl}
            </div>
            <button
              onClick={copyToClipboard}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

