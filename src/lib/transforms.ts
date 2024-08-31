import type { Entry } from 'ldapts';

export const blobToBase64 = (file: Blob) => {
	return new Promise<string>((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.readAsDataURL(file);
		fileReader.onload = () => {
			resolve(fileReader.result as string);
		};
		fileReader.onerror = (error) => {
			reject(error);
		};
	});
};

export const b64ToObjectURL = (b64String: string, mimeType = 'image/jpeg'): string => {
	// Convert base64 to a typed array
	const byteString = atob(b64String.split(',')[1]);
	const arrayBuffer = new ArrayBuffer(byteString.length);
	const unit8Array = new Uint8Array(arrayBuffer);
	for (let i = 0; i < byteString.length; i++) {
		unit8Array[i] = byteString.charCodeAt(i);
	}
	// Create a blob from the typed array
	const blob = new Blob([arrayBuffer], { type: mimeType });
	// Create an object URL from the blob
	const objectURL = URL.createObjectURL(blob);
	return objectURL;
};

export const jpegPhotoToB64 = <T = Entry>(entry?: T) => {
	if (entry && typeof entry === 'object' && 'jpegPhoto' in entry) {
		if (Array.isArray(entry.jpegPhoto) && entry.jpegPhoto.length === 0) {
			entry.jpegPhoto = undefined;
		} else {
			const base64String = Buffer.from(entry.jpegPhoto as string, 'base64').toString('base64');
			entry.jpegPhoto = `data:image/jpeg;base64,${base64String}`;
		}
	}
	return entry as T;
};
