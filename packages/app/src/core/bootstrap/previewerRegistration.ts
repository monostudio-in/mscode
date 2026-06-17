// src/core/bootstrap/previewerRegistration
import { customPreviewerRegistry } from '@/core/extensionAPI/registry/previewerRegistry';
import { ImagePreviewer } from '@/ui/previewer/ImagePreviewer/ImagePreviewer';

export const registerPreviewer = (): void => {
  customPreviewerRegistry.registerPreviewer({
    id: 'mscode.builtin.imagePreview',
    name: 'Mono Image Preview',
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'],
    component: ImagePreviewer,
    priority: 10, // Default priority (extensions can use 20, 100, etc. to override)
  });

};