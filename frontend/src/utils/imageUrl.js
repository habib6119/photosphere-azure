export function resolveImageUrl(imageUrl = '') {
  return imageUrl.replace('${CLIENT_URL}', window.location.origin);
}
