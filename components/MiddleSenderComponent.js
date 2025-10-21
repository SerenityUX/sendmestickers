import { useState, useRef, useEffect } from "react";

export default function MiddleSenderComponent({ mode, setMode, prefilledUsername }) {
  const [uploadState, setUploadState] = useState("upload"); // "upload", "uploading", "result"
  const [imageUrl, setImageUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [username, setUsername] = useState(prefilledUsername || "@");
  const [buttonText, setButtonText] = useState("Send Sticker");
  const [isSending, setIsSending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Update username when prefilledUsername changes
  useEffect(() => {
    if (prefilledUsername) {
      setUsername(prefilledUsername);
    }
  }, [prefilledUsername]);

  const handleFileSelect = (file) => {
    if (!file) return;

    setUploadState("uploading");
    setUploadProgress(0);
    setImageUrl("");

    const formData = new FormData();
    formData.append("image", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setImageUrl(data.imageUrl);
          setUploadState("result");
        }
      }
    });

    xhr.addEventListener("error", () => {
      setUploadState("upload");
    });

    xhr.open("POST", "/api/uploadImage");
    xhr.send(formData);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setUploadState("upload");
    setImageUrl("");
    setUploadProgress(0);
  };

  const handleSendSticker = async () => {
    setIsSending(true);
    setIsError(false);
    setIsSuccess(false);
    setButtonText("Confirming sticker...");
    
    try {
      // First, verify the receiver exists
      const verifyResponse = await fetch("/api/sendSticker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle: username.slice(1), // Remove @ symbol for API
          imageUrl: imageUrl,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        // Handle errors, especially 404 for receiver not found
        setIsError(true);
        if (verifyResponse.status === 404) {
          setButtonText("Receiver not found");
        } else {
          setButtonText(verifyData.error || "Error sending sticker");
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        setButtonText("Send Sticker");
        setIsSending(false);
        setIsError(false);
        return;
      }

      // Receiver exists, now create Stripe checkout
      setIsSuccess(true);
      setButtonText("Creating checkout...");
      
      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          username: username,
          handle: username.slice(1),
        }),
      });

      const checkoutData = await checkoutResponse.json();

      if (checkoutData.url) {
        setButtonText("Taking you to checkout...");
        await new Promise(resolve => setTimeout(resolve, 500));
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url;
      } else {
        setIsError(true);
        setButtonText("Checkout failed");
        await new Promise(resolve => setTimeout(resolve, 2000));
        setButtonText("Send Sticker");
        setIsSending(false);
        setIsError(false);
      }
    } catch (error) {
      setIsError(true);
      setButtonText("Error sending sticker");
      await new Promise(resolve => setTimeout(resolve, 2000));
      setButtonText("Send Sticker");
      setIsSending(false);
      setIsError(false);
    }
  };

  const isButtonDisabled = !imageUrl || username === "@" || username === "" || isSending;

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      width: "100%", 
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 5,
      padding: "20px",
      marginTop: "0px"
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
        <div style={{ 
          border: "2px dotted grey", 
          borderRadius: "12px",
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          {uploadState === "upload" && (
            <div
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ display: "none" }}
              />
              <p>Upload your image</p>
            </div>
          )}

          {uploadState === "uploading" && (
            <p>Uploading {uploadProgress}%</p>
          )}

          {uploadState === "result" && (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <button
                onClick={handleDelete}
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  zIndex: 10,
                  cursor: "pointer"
                }}
              >
                X
              </button>
              <img
                src={imageUrl}
                alt="Uploaded"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "12px"
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Handle (username)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              const value = e.target.value;
              if (value.startsWith("@")) {
                setUsername(value);
              } else {
                setUsername("@" + value);
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <button
          onClick={handleSendSticker}
          disabled={isButtonDisabled}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isSuccess ? "#16a34a" : (isError ? "#dc2626" : (isButtonDisabled ? "#ccc" : "#0070f3")),
            color: "white",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

