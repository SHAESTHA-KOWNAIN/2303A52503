import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

interface Props {
  value?: string;
  onChange?: (newFilter?: string) => void;
}

export default function NotificationFilter({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      onChange={(_, v) => onChange?.(v)}
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type === "All" ? undefined : type} sx={{ textTransform: "none", px: 2 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
