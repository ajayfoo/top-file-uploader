import { getDurationValues } from "../functions.js";
import { durationSubfieldsObject, sharingCheckbox } from "./globals.js";

const updateSharing = async () => {
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
    }),
  });
  return response.ok;
};

export { updateSharing };
