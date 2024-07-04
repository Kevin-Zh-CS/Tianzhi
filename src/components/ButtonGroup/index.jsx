import React from 'react';
import { Button } from 'quanta-design';

// 2个按钮组
// 默认右边按钮表示积极操作
// 传入 change = true 表示左边按钮表示积极操作
const ButtonGroup = props => {
  const {
    change = false,
    left = 'left',
    right = 'right',
    leftIcon = null,
    rightIcon = null,
    onClickL = null,
    onClickR = null,
    rightDisabled = false,
    className,
    ...restProps
  } = props;
  let typeL;
  let typeR;
  if (change) {
    typeL = 'primary';
  } else {
    typeR = 'primary';
  }
  return (
    <div className={className} {...restProps}>
      {left ? (
        <Button icon={leftIcon} type={typeL} onClick={onClickL} style={{ marginRight: 8 }}>
          {left}
        </Button>
      ) : null}
      {right ? (
        <Button icon={rightIcon} type={typeR} onClick={onClickR} disabled={rightDisabled}>
          {right}
        </Button>
      ) : null}
    </div>
  );
};

export default ButtonGroup;
