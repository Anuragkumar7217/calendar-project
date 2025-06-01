import React from "react";
import { format } from "date-fns";

const ModalHeader = ({ selectedDate, backupCompleted }) => (
  <h2 className={`text-lg font-semibold mb-4 ${backupCompleted ? "text-green-600" : "text-black"}`}>
    Actions for {format(selectedDate, "PPP")}
  </h2>
);

export default ModalHeader;
