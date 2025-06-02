/**
 * Convert an SVG element to a base64 encoded PNG image
 * @param svgElement The SVG element to convert
 * @returns Promise that resolves with the base64 encoded PNG
 */
export const svgToBase64Image = async (svgElement: SVGElement): Promise<string> => {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Error loading SVG'));
    };
    img.src = svgUrl;
  });
};

/**
 * Get the chart SVG element from a Recharts container
 * @param containerElement The container element that wraps the Recharts chart
 * @returns The SVG element or null if not found
 */
export const getChartSvg = (containerElement: HTMLDivElement | null): SVGElement | null => {
  if (!containerElement) return null;
  return containerElement.querySelector('.recharts-wrapper svg');
};
