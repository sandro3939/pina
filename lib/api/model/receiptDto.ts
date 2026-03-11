export interface UploadUrlResponseDto {
  uploadUrl: string;
  s3Key: string;
}

export interface ProcessReceiptDto {
  s3Key: string;
  weekKey?: string;
}

export interface RecognizedItemDto {
  name: string;
  quantity?: string;
}

export interface ProcessReceiptResponseDto {
  items: RecognizedItemDto[];
  addedToPantry: number;
  addedToShopping?: number;
}
