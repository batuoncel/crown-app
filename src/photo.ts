import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

// Shrinks a photo to 600px wide and returns it as a JPEG data URI (~40–80 KB),
// so it can be stored with the collection on the device and survives cache clears.
export async function shrink(uri: string): Promise<string> {
  try {
    const ctx = ImageManipulator.manipulate(uri);
    ctx.resize({ width: 600, height: null });
    const ref = await ctx.renderAsync();
    const r = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
    return r.base64 ? 'data:image/jpeg;base64,' + r.base64 : r.uri;
  } catch {
    return uri;
  }
}

// Picks one photo from the library, square-cropped.
export async function pickPhoto(): Promise<string | undefined> {
  try {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (r.canceled || !r.assets?.length) return undefined;
    return shrink(r.assets[0].uri);
  } catch {
    return undefined;
  }
}
