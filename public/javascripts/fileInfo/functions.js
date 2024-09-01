import { getDurationValues } from "../functions.js";
import { durationSubfieldsObject, sharingCheckbox } from "./globals.js";

const updateSharing = async (signal) => {
  const fileId = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1,
  );
  const enableSharing = sharingCheckbox.checked;
  const url = "/sharedFileUrls";
  if (!enableSharing) {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId,
      }),
      signal,
    });
    return response.ok;
  }
  const durationValues = getDurationValues(durationSubfieldsObject);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
      enableSharing,
      ...durationValues,
      signal,
    }),
  });
  return response.ok;
};

export { updateSharing };
