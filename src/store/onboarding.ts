
export type SlideType = {
  id: string;
  animation: string;
  title: string;
  description: string;
  Component?: () => JSX.Element;
};