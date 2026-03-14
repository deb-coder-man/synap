declare module "masonry-grid" {
  import { ReactNode } from "react";

  interface MasonryGridProps {
    children: ReactNode | ReactNode[];
    gap?: string;
    minWidth?: number;
  }

  export default function MasonryGrid(props: MasonryGridProps): JSX.Element;
}
