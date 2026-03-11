import { useMutation } from '@tanstack/react-query';
import type { MutationFunction, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { customInstance } from '../../axios-instance';
import type {
  UploadUrlResponseDto,
  ProcessReceiptDto,
  ProcessReceiptResponseDto,
} from '../../model/receiptDto';

export const receiptControllerGetUploadUrl = () => {
  return customInstance<UploadUrlResponseDto>({ url: '/receipt/upload-url', method: 'GET' });
};

export const receiptControllerProcess = (dto: ProcessReceiptDto) => {
  return customInstance<ProcessReceiptResponseDto>({
    url: '/receipt/process',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: dto,
  });
};

export const useReceiptControllerProcess = <
  TError = unknown,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof receiptControllerProcess>>,
    TError,
    ProcessReceiptDto,
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<typeof receiptControllerProcess>>,
  TError,
  ProcessReceiptDto,
  TContext
> => {
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof receiptControllerProcess>>,
    ProcessReceiptDto
  > = (dto) => receiptControllerProcess(dto);
  return useMutation({ mutationFn, ...(options?.mutation ?? {}) });
};
