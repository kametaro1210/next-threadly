import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * コンポーネントのclassNameをまとめ、Tailwind CSSの競合クラスを整理するためのファイルです。
 * classNameを複数組み合わせるとき（主にUIコンポーネント）に使います。
 * 注意: クラスの結合方法や競合ルールを変える場合は、このファイルを修正してください。
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}