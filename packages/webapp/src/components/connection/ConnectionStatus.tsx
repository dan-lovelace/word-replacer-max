import { useEffect, useState } from "react";

import Box from "@mui/material/Box/Box";
import useTheme from "@mui/material/styles/useTheme";
import Tooltip from "@mui/material/Tooltip/Tooltip";

import { useConnectionProvider } from "../../lib/connection/ConnectionProvider";

export default function ConnectionStatus() {
  const { palette } = useTheme();

  const [statusColor, setStatusColor] = useState<string>();
  const [statusMessage, setStatusMessage] = useState<string>();

  const { isConnected, isConnecting } = useConnectionProvider();

  useEffect(() => {
    let newStatusColor = palette.info.main;
    let newStatusMessage = "";

    if (isConnecting) {
      newStatusColor = palette.info.main;
      newStatusMessage = "Connecting...";
    } else {
      newStatusColor = isConnected ? palette.success.main : palette.error.main;
      newStatusMessage = isConnected
        ? "Extension connected"
        : "Failed to connect";
    }

    setStatusColor(newStatusColor);
    setStatusMessage(newStatusMessage);
  }, [isConnected, isConnecting]);

  return (
    <Tooltip title={statusMessage}>
      <Box
        sx={{
          backgroundColor: statusColor,
          borderRadius: "100%",
          height: 16,
          width: 16,
        }}
      />
    </Tooltip>
  );
}
