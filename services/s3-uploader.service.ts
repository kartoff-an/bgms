export const uploadFileToS3 = async (uploadUrl: string, fileUri: string, contentType: string) => {
    const response = await fetch(fileUri);
    // console.log(response);
    const blob = await response.blob();

    const upload = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": contentType,
        },
        body: blob,
    });

    // console.log("Upload status:", upload);

    if (!upload.ok) {
        throw new Error("S3 upload failed");
    }

    return true;
};
