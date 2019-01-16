// vim: set ts=2 sts=2 sw=2 et:
// @flow
//
// The main component of the Lifting page, contained by the LiftingView.

import React from "react";
import { connect } from "react-redux";

import AttemptInput from "./AttemptInput";

import { getWeightClassStr } from "../../reducers/meetReducer.js";
import {
  getProjectedTotalKg,
  getProjectedWilks,
  liftToAttemptFieldName,
  liftToStatusFieldName
} from "../../reducers/registrationReducer";

import styles from "./LiftingTable.module.scss";

type Props = {
  meet: {
    weightClassesKgMen: Array<number>,
    weightClassesKgWomen: Array<number>
  },
  lifting: {
    lift: string
  },
  attemptOneIndexed: number,
  orderedEntries: Array<Object>,
  currentEntryId?: number
};

// List of possible columns that can be rendered.
// The main render() function decides what columns to render,
// and communicates its selection with each row's renderer.
type ColumnType =
  | "Name"
  | "Bodyweight"
  | "WeightClass"
  | "Equipment"
  | "S1" | "S2" | "S3" | "S4" // eslint-disable-line
  | "B1" | "B2" | "B3" | "B4" // eslint-disable-line
  | "D1" | "D2" | "D3" | "D4" // eslint-disable-line
  | "BestSquat" | "BestBench" // eslint-disable-line
  | "ProjectedTotal"
  | "ProjectedPoints"
  | "Total";

class LiftingTable extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.renderRows = this.renderRows.bind(this);
  }

  renderBest3AttemptField(entry, lift, columnType: ColumnType) {
    const fieldKg = liftToAttemptFieldName(lift);
    const fieldStatus = liftToStatusFieldName(lift);

    let best3 = 0.0;
    for (let i = 0; i < 3; i++) {
      if (entry[fieldStatus][i] === 1) {
        best3 = Math.max(best3, entry[fieldKg][i]);
      }
    }

    if (best3 === 0) {
      return <td key={columnType} />;
    }
    return <td key={columnType}>{best3}</td>;
  }

  renderAttemptField(entry, lift, attemptOneIndexed: number, columnType: ColumnType) {
    const fieldKg = liftToAttemptFieldName(lift);
    const fieldStatus = liftToStatusFieldName(lift);

    const kg = entry[fieldKg][attemptOneIndexed - 1];
    const status = entry[fieldStatus][attemptOneIndexed - 1];

    // If the attempt was already made, render a colored text field.
    // The weight cannot be changed after the fact.
    if (status !== 0) {
      const className = status === 1 ? styles.goodlift : styles.nolift;
      const maybeNegative = status === 1 ? "" : "-";
      return (
        <td key={columnType} className={className}>
          {maybeNegative}
          {kg}
        </td>
      );
    }

    // If the attempt isn't for the current lift, just show the number.
    if (lift !== this.props.lifting.lift) {
      const kgStr = kg === 0 ? "" : String(kg);
      return <td key={columnType}>{kgStr}</td>;
    }

    // Was any previous attempt taken?
    let anyPreviousAttemptTaken = false;
    for (var i = 1; i < attemptOneIndexed; i++) {
      if (entry[fieldStatus][i - 1] !== 0) {
        anyPreviousAttemptTaken = true;
        break;
      }
    }

    // Show a text input box if either:
    // 1. This column is for the current attempt, and the lifter has a previous attempt.
    // 2. This column is for the next attempt, and the lifter took the current attempt.
    // 3. For whatever reason, someone managed to specify a weight.
    const currentAndHasPrevious = attemptOneIndexed === this.props.attemptOneIndexed && anyPreviousAttemptTaken;
    const nextAndTookLast =
      attemptOneIndexed === this.props.attemptOneIndexed + 1 &&
      entry[fieldStatus][this.props.attemptOneIndexed - 1] !== 0;

    if (kg !== 0 || currentAndHasPrevious || nextAndTookLast) {
      return (
        <td key={columnType} className={styles.attemptInputCell}>
          <AttemptInput entryId={entry.id} lift={lift} attemptOneIndexed={attemptOneIndexed} weightKg={kg} />
        </td>
      );
    }

    // Default handler.
    const kgStr = kg === 0 ? "" : String(kg);
    return <td key={columnType}>{kgStr}</td>;
  }

  renderCell = (entry: Object, columnType: ColumnType) => {
    switch (columnType) {
      case "Name":
        return <td key={columnType}>{entry.name}</td>;
      case "Bodyweight":
        return <td key={columnType}>{entry.bodyweightKg}</td>;
      case "WeightClass": {
        const classesForSex =
          entry.sex === "M" ? this.props.meet.weightClassesKgMen : this.props.meet.weightClassesKgWomen;
        const weightClass = getWeightClassStr(classesForSex, entry.bodyweightKg);
        return <td key={columnType}>{weightClass}</td>;
      }
      case "Equipment":
        return <td key={columnType}>{entry.equipment}</td>;
      case "S1":
        return this.renderAttemptField(entry, "S", 1, columnType);
      case "S2":
        return this.renderAttemptField(entry, "S", 2, columnType);
      case "S3":
        return this.renderAttemptField(entry, "S", 3, columnType);
      case "S4":
        return this.renderAttemptField(entry, "S", 4, columnType);
      case "B1":
        return this.renderAttemptField(entry, "B", 1, columnType);
      case "B2":
        return this.renderAttemptField(entry, "B", 2, columnType);
      case "B3":
        return this.renderAttemptField(entry, "B", 3, columnType);
      case "B4":
        return this.renderAttemptField(entry, "B", 4, columnType);
      case "D1":
        return this.renderAttemptField(entry, "D", 1, columnType);
      case "D2":
        return this.renderAttemptField(entry, "D", 2, columnType);
      case "D3":
        return this.renderAttemptField(entry, "D", 3, columnType);
      case "D4":
        return this.renderAttemptField(entry, "D", 4, columnType);
      case "BestSquat":
        return this.renderBest3AttemptField(entry, "S", columnType);
      case "BestBench":
        return this.renderBest3AttemptField(entry, "B", columnType);
      case "ProjectedTotal": {
        const totalKg = getProjectedTotalKg(entry);
        if (totalKg === 0) {
          return <td key={columnType}>DQ</td>;
        }
        return <td key={columnType}>{totalKg}</td>;
      }
      case "ProjectedPoints": {
        const points = getProjectedWilks(entry);
        if (points === 0) {
          return <td key={columnType} />;
        }
        return <td key={columnType}>{points.toFixed(2)}</td>;
      }
      case "Total":
        return <td key={columnType}>TODO</td>;
      default:
        (columnType: empty); // eslint-disable-line
        return <td key={columnType} />;
    }
  };

  renderRows = (columns: Array<ColumnType>) => {
    const orderedEntries = this.props.orderedEntries;
    const currentEntryId = this.props.currentEntryId;

    let rows = [];
    for (let i = 0; i < orderedEntries.length; i++) {
      const entry = orderedEntries[i];

      // Iterate over each columnType, handling each.
      let cells = [];
      for (let col = 0; col < columns.length; col++) {
        const columnType = columns[col];
        cells.push(this.renderCell(entry, columnType));
      }

      const isCurrent = entry.id === currentEntryId;
      const rowClassName = isCurrent ? styles.current : "";
      rows.push(
        <tr key={entry.id} className={rowClassName}>
          {cells}
        </tr>
      );
    }
    return rows;
  };

  getColumnHeaderString = (columnType: ColumnType): string => {
    switch (columnType) {
      case "Name":
        return "Name";
      case "Bodyweight":
        return "Bwt";
      case "WeightClass":
        return "Class";
      case "Equipment":
        return "Gear";
      case "S1":
        return "S1";
      case "S2":
        return "S2";
      case "S3":
        return "S3";
      case "S4":
        return "S4";
      case "B1":
        return "B1";
      case "B2":
        return "B2";
      case "B3":
        return "B3";
      case "B4":
        return "B4";
      case "D1":
        return "D1";
      case "D2":
        return "D2";
      case "D3":
        return "D3";
      case "D4":
        return "D4";
      case "BestSquat":
        return "Squat";
      case "BestBench":
        return "Bench";
      case "ProjectedTotal":
        return "Total";
      case "ProjectedPoints":
        return "Points";
      case "Total":
        return "Total";
      default:
        (columnType: empty); // eslint-disable-line
        return "";
    }
  };

  render() {
    // Select the columns for display.
    let columns: Array<ColumnType> = ["Name", "Bodyweight", "WeightClass", "Equipment"];

    // Select lift columns based off the current lift.
    if (this.props.lifting.lift === "S") {
      columns.push("S1", "S2", "S3");
      if (this.props.attemptOneIndexed === 4) {
        columns.push("S4");
      }
      columns.push("B1", "D1");
    } else if (this.props.lifting.lift === "B") {
      columns.push("BestSquat", "B1", "B2", "B3");
      if (this.props.attemptOneIndexed === 4) {
        columns.push("B4");
      }
      columns.push("D1");
    } else if (this.props.lifting.lift === "D") {
      columns.push("BestSquat", "BestBench", "D1", "D2", "D3");
      if (this.props.attemptOneIndexed === 4) {
        columns.push("D4");
      }
    }
    columns.push("ProjectedTotal", "ProjectedPoints");

    // Build headers.
    let headers = [];
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const className = column === "Name" ? "" : styles.smallCell;
      headers.push(
        <th key={column} className={className}>
          {this.getColumnHeaderString(column)}
        </th>
      );
    }

    return (
      <table className={styles.liftingtable}>
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{this.renderRows(columns)}</tbody>
      </table>
    );
  }
}

const mapStateToProps = state => {
  return {
    ...state
  };
};

export default connect(
  mapStateToProps,
  null
)(LiftingTable);
