// vim: set ts=2 sts=2 sw=2 et:
// @flow
//
// This file is part of OpenLifter, simple Powerlifting meet software.
// Copyright (C) 2019 The OpenPowerlifting Project.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Displays the results by division.

import React from "react";
import { connect } from "react-redux";

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

import { getFinalResults } from "../../logic/divisionPlace";
import { getWeightClassStr, getWeightClassLbsStr, wtclsStrKg2Lbs } from "../../reducers/meetReducer";
import {
  getBest5SquatKg,
  getBest5BenchKg,
  getBest5DeadliftKg,
  getFinalEventTotalKg,
  entryHasLifted
} from "../../logic/entry";
import { kg2lbs, displayWeight } from "../../logic/units";

import { bodyweight_multiple } from "../../logic/coefficients/bodyweight-multiple";
import { dots } from "../../logic/coefficients/dots";
import { glossbrenner } from "../../logic/coefficients/glossbrenner";
import { ipfpoints } from "../../logic/coefficients/ipf";
import { nasapoints } from "../../logic/coefficients/nasa";
import { schwartzmalone } from "../../logic/coefficients/schwartzmalone";
import { wilks } from "../../logic/coefficients/wilks";

import type { Category, CategoryResults } from "../../logic/divisionPlace";
import type { Entry, Formula, Sex } from "../../types/dataTypes";
import type { GlobalState } from "../../types/stateTypes";

interface StateProps {
  inKg: boolean;
  showAlternateUnits: boolean;
  meetName: string;
  formula: Formula;
  combineSleevesAndWraps: boolean;
  lengthDays: number;
  weightClassesKgMen: Array<number>;
  weightClassesKgWomen: Array<number>;
  weightClassesKgMx: Array<number>;
  entries: Array<Entry>;
}

interface OwnProps {
  day: string; // Really a number, 0 meaning "all".
}

type Props = StateProps & OwnProps;

const mapSexToClasses = (sex: Sex, props: Props): Array<number> => {
  switch (sex) {
    case "M":
      return props.weightClassesKgMen;
    case "F":
      return props.weightClassesKgWomen;
    case "Mx":
      return props.weightClassesKgMx;
    default:
      (sex: empty) // eslint-disable-line
      return props.weightClassesKgMen;
  }
};

class ByDivision extends React.Component<Props> {
  renderEntryRow = (entry: Entry, category: Category, key: number): any => {
    // Skip no-show entries.
    if (!entryHasLifted(entry)) return null;

    // Skip DQ'd lifters. Meet directors have reported that it's embarrassing
    // to the DQ'd lifter to have that projected.
    const totalKg = getFinalEventTotalKg(entry, category.event);
    if (totalKg === 0) return null;

    const classes = mapSexToClasses(entry.sex, this.props);
    const squatKg = getBest5SquatKg(entry);
    const benchKg = getBest5BenchKg(entry);
    const deadliftKg = getBest5DeadliftKg(entry);

    const inKg = this.props.inKg;
    const total = inKg ? totalKg : kg2lbs(totalKg); // For display.

    // The place proceeds in order by key, except for DQ entries.
    const place = totalKg === 0 ? "DQ" : key + 1;

    // TODO: Share this code with ByPoints.
    let points = 0;
    switch (this.props.formula) {
      case "Bodyweight Multiple":
        points = bodyweight_multiple(entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "Dots":
        points = dots(entry.sex, entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "Glossbrenner":
        points = glossbrenner(entry.sex, entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "Wilks":
        points = wilks(entry.sex, entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "IPF Points":
        points = ipfpoints(totalKg, entry.bodyweightKg, entry.sex, category.equipment, category.event).toFixed(2);
        break;
      case "Schwartz/Malone":
        points = schwartzmalone(entry.sex, entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "NASA Points":
        points = nasapoints(entry.bodyweightKg, totalKg).toFixed(2);
        break;
      case "Total":
        points = total.toFixed(2);
        break;
      default:
        (this.props.formula: empty) // eslint-disable-line
        break;
    }

    let pointsStr = "";
    if (totalKg !== 0 && points === 0) pointsStr = "N/A";
    else if (totalKg !== 0 && points !== 0) pointsStr = points;

    const wtcls = inKg
      ? getWeightClassStr(classes, entry.bodyweightKg)
      : getWeightClassLbsStr(classes, entry.bodyweightKg);
    const bw = inKg ? entry.bodyweightKg : kg2lbs(entry.bodyweightKg);
    const squat = inKg ? squatKg : kg2lbs(squatKg);
    const bench = inKg ? benchKg : kg2lbs(benchKg);
    const deadlift = inKg ? deadliftKg : kg2lbs(deadliftKg);

    const unit = inKg ? "kg" : "lb";
    const otherUnit = inKg ? "lb" : "kg";

    // Calculate the total in the alternate units, if requested.
    let alternateTotal: string | null = null;
    if (this.props.showAlternateUnits === true && totalKg !== 0) {
      const amount = inKg ? kg2lbs(totalKg) : totalKg;
      alternateTotal = unit + " / " + displayWeight(amount) + otherUnit;
    }

    return (
      <tr key={key}>
        <td>{place}</td>
        <td>{entry.name}</td>
        <td>{entry.bodyweightKg === 0 ? null : wtcls}</td>
        <td>{entry.bodyweightKg === 0 ? null : displayWeight(bw)}</td>
        <td>{entry.age === 0 ? null : entry.age}</td>
        <td>{squatKg === 0 ? "" : displayWeight(squat)}</td>
        <td>{benchKg === 0 ? "" : displayWeight(bench)}</td>
        <td>{deadliftKg === 0 ? "" : displayWeight(deadlift)}</td>
        <td>
          {totalKg === 0 ? "" : displayWeight(total)}
          {alternateTotal}
        </td>
        <td>{pointsStr}</td>
      </tr>
    );
  };

  mapSexToLabel = (sex: Sex): string => {
    switch (sex) {
      case "M":
        return "Men's";
      case "F":
        return "Women's";
      case "Mx":
        return "Mx";
      default:
        (sex: empty) // eslint-disable-line
        return "";
    }
  };

  renderCategoryResults = (results: CategoryResults, key: number): any => {
    const { category, orderedEntries } = results;
    const sex = this.mapSexToLabel(category.sex);

    // Gather rows.
    let rows = [];
    for (let i = 0; i < orderedEntries.length; i++) {
      const row = this.renderEntryRow(orderedEntries[i], category, i);
      if (row !== null) {
        rows.push(row);
      }
    }

    // If all entries were no-show, don't show this panel.
    if (rows.length === 0) {
      return null;
    }

    let eqpstr: string = category.equipment;
    if (this.props.combineSleevesAndWraps) {
      eqpstr = "Sleeves + Wraps";
    }

    let units = this.props.inKg ? "kilo" : "pound";

    // Convert the category.weightClassStr to pounds.
    let wtcls = category.weightClassStr;
    if (category.weightClassStr !== "" && !this.props.inKg) {
      wtcls = wtclsStrKg2Lbs(category.weightClassStr);
    }

    return (
      <Card key={key}>
        <Card.Header>
          {sex} {wtcls} {category.weightClassStr !== "" ? units : null} {eqpstr} {category.division} {category.event}
        </Card.Header>
        <Card.Body>
          <Table hover size="sm">
            <thead>
              <tr>
                <th>Place</th>
                <th>Name</th>
                <th>Class</th>
                <th>Bwt</th>
                <th>Age</th>
                <th>Squat</th>
                <th>Bench</th>
                <th>Deadlift</th>
                <th>Total</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  render() {
    const results = getFinalResults(
      this.props.entries,
      this.props.weightClassesKgMen,
      this.props.weightClassesKgWomen,
      this.props.weightClassesKgMx,
      this.props.combineSleevesAndWraps
    );

    let categoryCards = [];
    for (let i = 0; i < results.length; i++) {
      const panel = this.renderCategoryResults(results[i], i);
      if (panel !== null) {
        categoryCards.push(panel);
      }
    }

    return <div>{categoryCards}</div>;
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps): StateProps => {
  const day = Number(ownProps.day);
  let entries = state.registration.entries;
  if (day > 0) {
    entries = entries.filter(e => e.day === day);
  }

  return {
    inKg: state.meet.inKg,
    showAlternateUnits: state.meet.showAlternateUnits,
    meetName: state.meet.name,
    formula: state.meet.formula,
    combineSleevesAndWraps: state.meet.combineSleevesAndWraps,
    lengthDays: state.meet.lengthDays,
    weightClassesKgMen: state.meet.weightClassesKgMen,
    weightClassesKgWomen: state.meet.weightClassesKgWomen,
    weightClassesKgMx: state.meet.weightClassesKgMx,
    entries: entries
  };
};

export default connect(
  mapStateToProps,
  null
)(ByDivision);
