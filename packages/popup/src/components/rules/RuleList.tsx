import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";

import { forwardRef, useEffect, useMemo, useRef } from "preact/compat";

import { Matcher } from "@worm/types/src/rules";

import { useConfig } from "../../store/Config";

import RuleRow from "../rules/RuleRow";

type RowProps = ListChildComponentProps<Matcher[]>;

const GAP_SIZE = 8;
const ROW_HEIGHT_BASE = 78;

const rowHeight = ROW_HEIGHT_BASE + GAP_SIZE;

const getGappedSize = (size: number) => size + GAP_SIZE;

const ListContainer = forwardRef<HTMLDivElement, RowProps>(
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

export default function RuleList() {
  const { matchers } = useConfig();

  const listRef = useRef<VariableSizeList>();
  const itemSizes = useRef<Record<number, number>>({});

  const getItemSize = (index: number) => {
    const { current } = itemSizes;

    if (!current) {
      throw new Error(`Unable to get item size at index '${index}'`);
    }

    const itemSize = current[index];

    return getGappedSize(itemSize);
  };

  const updateItemSize = (index: number, newSize: number) => {
    listRef.current?.resetAfterIndex(0);

    itemSizes.current = {
      ...itemSizes.current,
      [index]: newSize,
    };
  };

  // const Row = ({ data, index, style }: RowProps) => {
  //   const itemRef = useRef<HTMLDivElement>(null);

  //   useEffect(() => {
  //     if (!itemRef.current) return;

  //     const { clientHeight } = itemRef.current;

  //     updateItemSize(index, clientHeight);
  //   }, [itemRef]);

  //   const matcher = data[index];

  //   return (
  //     <div
  //       className="rule-row"
  //       key={matcher.identifier} // IMPORTANT: Keep this key unique!
  //       style={{
  //         ...style,
  //         top: Number(style.top) + GAP_SIZE,
  //       }}
  //     >
  //       <div className="container-fluid" ref={itemRef}>
  //         <RuleRow matcher={matcher} />
  //       </div>
  //     </div>
  //   );
  // };

  /**
   * The row is memoized on the first render and never updated. This is because
   * modifying it causes the virtualization library to re-render the entire row
   * which results in losing several contextual properties (i.e., element
   * focus, dropdown open states). Subsequent updates that affect the row's
   * height are delivered from within the row via `handleSizeChange`.
   */
  const Row = useMemo(() => {
    return ({ data, index, style }: RowProps) => {
      const itemRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        render();
      }, [itemRef]);

      const render = () => {
        if (!itemRef.current) return;

        const { clientHeight } = itemRef.current;

        updateItemSize(index, clientHeight);
      };

      const matcher = data[index];

      return (
        <div
          className="rule-row"
          key={matcher.identifier} // IMPORTANT: Key must be present and unique!
          style={{
            ...style,
            top: Number(style.top) + GAP_SIZE,
          }}
        >
          <div className="container-fluid" ref={itemRef}>
            <RuleRow matcher={matcher} handleSizeChange={render} />
          </div>
        </div>
      );
    };
  }, []);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList<Matcher[]>
          estimatedItemSize={rowHeight}
          height={height}
          innerElementType={ListContainer}
          itemCount={matchers.length}
          itemData={matchers}
          itemSize={getItemSize}
          ref={listRef}
          width={width}
          data-testid="rule-list-wrapper"
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
}
