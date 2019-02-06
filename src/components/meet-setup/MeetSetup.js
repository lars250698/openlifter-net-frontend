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

import React from "react";
import { connect } from "react-redux";
import { Grid, Col, Row, Panel, FormGroup, ControlLabel, FormControl } from "react-bootstrap";

import MeetName from "./MeetName";
import MeetDate from "./MeetDate";
import MeetLength from "./MeetLength";
import MeetLocation from "./MeetLocation";
import PlatformCounts from "./PlatformCounts";
import InKg from "./InKg";
import FormulaSelect from "./FormulaSelect";
import FederationSelect from "./FederationSelect";
import DivisionSelect from "./DivisionSelect";
import WeightClassesSelect from "./WeightClassesSelect";
import BarAndCollarsWeightKg from "./BarAndCollarsWeightKg";
import Plates from "./Plates";

import { updateMeet } from "../../actions/meetSetupActions";

import type { GlobalState } from "../../types/stateTypes";

interface StateProps {
  inKg: boolean;
  areWrapsRaw: boolean;
}

interface DispatchProps {
  setAreWrapsRaw: (event: Object) => void;
}

type Props = StateProps & DispatchProps;

const yesNoBooleanOptions = [
  <option key="Yes" value={true}>
    Yes
  </option>,
  <option key="No" value={false}>
    No
  </option>
];

class MeetSetup extends React.Component<Props> {
  render() {
    // This is used as a key to force unit-dependent components to re-initialize state.
    const inKg = String(this.props.inKg);

    return (
      <Grid>
        <Row>
          <Col md={4}>
            <Panel bsStyle="info">
              <Panel.Heading>Sanction Information</Panel.Heading>
              <Panel.Body>
                <MeetName />
                <MeetLocation />
                <FederationSelect />
                <MeetDate />
                <MeetLength />
                <PlatformCounts />
              </Panel.Body>
            </Panel>
          </Col>

          <Col md={4}>
            <Panel>
              <Panel.Heading>Competition Rules</Panel.Heading>
              <Panel.Body>
                <DivisionSelect />
                <WeightClassesSelect sex="M" label="Men's Weight Classes (kg), omit SHW" />
                <WeightClassesSelect sex="F" label="Women's Weight Classes (kg), omit SHW" />
                <WeightClassesSelect sex="Mx" label="Mx Weight Classes (kg), omit SHW" />
                <FormulaSelect />

                <FormGroup>
                  <ControlLabel>Should Raw and Wraps be combined for placing?</ControlLabel>
                  <FormControl
                    componentClass="select"
                    defaultValue={this.props.areWrapsRaw}
                    onChange={this.props.setAreWrapsRaw}
                  >
                    {yesNoBooleanOptions}
                  </FormControl>
                </FormGroup>
              </Panel.Body>
            </Panel>
          </Col>

          <Col md={4}>
            <Panel bsStyle="info">
              <Panel.Heading>Weights and Loading Setup</Panel.Heading>
              <Panel.Body>
                <InKg />
                <BarAndCollarsWeightKg key={inKg} />
                <Plates />
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const mapStateToProps = (state: GlobalState): StateProps => ({
  inKg: state.meet.inKg,
  areWrapsRaw: state.meet.areWrapsRaw
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
  setAreWrapsRaw: event => dispatch(updateMeet({ areWrapsRaw: event.target.value }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeetSetup);
