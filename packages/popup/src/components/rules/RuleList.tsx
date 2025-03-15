import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";

import { forwardRef } from "preact/compat";

import { Matcher } from "@worm/types/src/rules";

import { useConfig } from "../../store/Config";

import RuleRow from "../rules/RuleRow";

type RowProps = ListChildComponentProps<Matcher[]>;

const GAP_SIZE = 8;

const innerElementType = forwardRef<HTMLDivElement, RowProps>(
  ({ style, ...rest }: RowProps, ref) => (
    <div
      ref={ref}
      style={{
        ...style,
        paddingTop: GAP_SIZE,
      }}
      {...rest}
      data-testid="inner-element-type"
    />
  )
);

const Row = ({ data, index, style }: RowProps) => {
  const matcher = data[index];

  return (
    <div
      className="rule-row"
      key={matcher.identifier} // IMPORTANT: Keep this key unique!
      style={{
        ...style,
        top: Number(style.top) + GAP_SIZE,
      }}
    >
      <div className="container-fluid">
        <RuleRow matcher={matcher} />
      </div>
    </div>
  );
};

export default function RuleList() {
  const { matchers } = useConfig();

  const getItemSize = (index: number) => {
    // TODO: calculate element's scroll height
    return 78 + GAP_SIZE;
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList<Matcher[]>
          height={height}
          innerElementType={innerElementType}
          itemCount={matchers.length}
          itemData={matchers}
          itemSize={getItemSize}
          width={width}
          data-testid="rule-list-wrapper"
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
}
