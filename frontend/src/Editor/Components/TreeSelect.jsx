import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line import/no-unresolved
import CheckboxTree from 'react-checkbox-tree';
// eslint-disable-next-line import/no-unresolved
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { isExpectedDataType } from '@/_helpers/utils.js';
import '@/_styles/widgets/tree-select.scss';

export const TreeSelect = ({
  height,
  properties,
  styles,
  setExposedVariable,
  setExposedVariables,
  fireEvent,
  darkMode,
  dataCy,
}) => {
  const { label } = properties;
  const { visibility, disabledState, checkboxColor, boxShadow } = styles;
  const textColor = darkMode && styles.textColor === '#000' ? '#fff' : styles.textColor;
  const [checked, setChecked] = useState(checkedData);
  const [expanded, setExpanded] = useState(expandedData);
  const data = isExpectedDataType(properties.data, 'array');
  const checkedData = isExpectedDataType(properties.checkedData, 'array');
  const expandedData = isExpectedDataType(properties.expandedData, 'array');
  const [modifiedData, setModifiedData] = useState([]);
  let pathObj = {};

  const addClassNameBasedOnTheme = (data, isDarkMode, textColor) => {
    const className = isDarkMode && textColor === '#000' ? 'dark-mode' : 'light-mode';;

    data.forEach(item => {
      item.className = className;

      // If the item has children, apply the className recursively
      if (item.children && item.children.length) {
        addClassNameBasedOnTheme(item.children, isDarkMode, textColor);
      }
    });
  };

  useEffect(() => {
    const checkedArr = [],
      checkedPathArray = [],
      checkedPathString = [];
    const updateCheckedArr = (array = [], selected, isSelected = false) => {
      array.forEach((node) => {
        if (isSelected || selected.includes(node.value)) {
          checkedArr.push(node.value);
          updateCheckedArr(node.children, selected, true);
        } else {
          updateCheckedArr(node.children, selected);
        }
      });
    };
    updateCheckedArr(data, checkedData);
    setChecked(checkedArr);
    checkedArr.forEach((item) => {
      checkedPathArray.push(pathObj[item]);
      checkedPathString.push(pathObj[item].join('-'));
    });

    const exposedVariables = {
      checkedPathArray: checkedPathArray,
      checkedPathStrings: checkedPathString,
      checked: checkedArr,
    };
    setExposedVariables(exposedVariables);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(checkedData), JSON.stringify(data)]);

  useEffect(() => {
    const dataCopy = JSON.parse(JSON.stringify(data));
    addClassNameBasedOnTheme(dataCopy, darkMode, styles.textColor);
    setModifiedData(dataCopy);
  }, [darkMode]);

  useEffect(() => {
    setExposedVariable('expanded', expandedData);
    setExpanded(expandedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(expandedData)]);

  pathObj = useMemo(() => {
    let nodePath = {};
    function checkedPath(nodes, arr = []) {
      for (const node of nodes) {
        nodePath[node.value] = [...arr, node.value];
        if (node?.children?.length > 0) {
          checkedPath(node.children, [...arr, node.value]);
        }
      }
    }
    checkedPath(data, []);
    return nodePath;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  const onCheck = (checked, updatedNode) => {
    const checkedPathArray = [],
      checkedPathString = [];
    checked.forEach((item) => {
      checkedPathArray.push(pathObj[item]);
      checkedPathString.push(pathObj[item].join('-'));
    });

    const exposedVariables = {
      checkedPathArray: checkedPathArray,
      checkedPathStrings: checkedPathString,
      checked: checked,
    };
    setExposedVariables(exposedVariables);

    updatedNode.checked ? fireEvent('onCheck') : fireEvent('onUnCheck');
    fireEvent('onChange');
    setChecked(checked);
  };

  const onExpand = (expanded) => {
    setExposedVariable('expanded', expanded);
    setExpanded(expanded);
  };

  return (
    <div
      className="custom-checkbox-tree"
      data-disabled={disabledState}
      style={{
        maxHeight: height,
        display: visibility ? '' : 'none',
        color: textColor,
        accentColor: checkboxColor,
        boxShadow,
      }}
      data-cy={dataCy}
    >
      <div className="card-title" style={{ marginBottom: '0.5rem', color: textColor, }}>
        {label}
      </div>
      <CheckboxTree
        nodes={modifiedData}
        checked={checked}
        expanded={expanded}
        showNodeIcon={false}
        onCheck={onCheck}
        onExpand={onExpand}
        nativeCheckboxes
        checkModel="all"
        disabled={disabledState}
      />
    </div>
  );
};
