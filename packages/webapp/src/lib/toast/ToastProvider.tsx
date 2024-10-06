import React, { createContext, useContext, useState, ReactNode } from "react";

import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert/Alert";
import Snackbar from "@mui/material/Snackbar/Snackbar";

import { PopupAlertSeverity } from "@worm/types";

type ToastContextProps = {
  showToast: (message: string, severity?: PopupAlertSeverity) => void;
};

type ToastProviderProps = {
  children: ReactNode;
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const ToastContext = createContext<ToastContextProps>({} as ToastContextProps);

export function useToast(): ToastContextProps {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");

  const showToast = (message: string, severity?: PopupAlertSeverity) => {
    setMessage(message);
    setOpen(true);

    /**
     * Translate Bootstrap 5 severities to MUI. The same types are used across
     * multiple packages and we need to account for both.
     */
    let alertColor: AlertColor = "info";
    switch (severity) {
      case "danger":
        alertColor = "error";
        break;
      case "success":
        alertColor = "success";
    }

    setSeverity(alertColor);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
