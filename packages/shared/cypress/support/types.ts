export type TargetProps = Partial<HTMLElement>;

export type VisitMockParams = {
  bodyContents?: string;
  html?: string;
  scriptContents?: string;
  styleContents?: string;
  targetContents?: string;
  targetProps?: TargetProps;
  titleContents?: string;
};
