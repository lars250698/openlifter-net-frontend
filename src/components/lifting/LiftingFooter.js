// vim: set ts=2 sts=2 sw=2 et:
//
// The footer of the Lifting page, contained by the LiftingView.
// This is the parent element of the controls that affect present lifting state.

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Button, FormControl } from "react-bootstrap";

import { setLiftingGroup, overrideAttempt, overrideEntryId } from "../../actions/liftingActions";

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  position: "fixed",
  left: 0,
  bottom: 0,
  width: "100%",
  backgroundColor: "#f8f8f8",
  borderTop: "1px solid #e7e7e7"
};

const liftOptions = [
  <option key={0} value={"S"}>
    Squat
  </option>,
  <option key={1} value={"B"}>
    Bench
  </option>,
  <option key={2} value={"D"}>
    Deadlift
  </option>
];

const flightOptions = [
  <option key={0} value={"A"}>
    Flight A
  </option>,
  <option key={1} value={"B"}>
    Flight B
  </option>,
  <option key={2} value={"C"}>
    Flight C
  </option>,
  <option key={3} value={"D"}>
    Flight D
  </option>,
  <option key={4} value={"E"}>
    Flight E
  </option>,
  <option key={5} value={"F"}>
    Flight F
  </option>,
  <option key={6} value={"G"}>
    Flight G
  </option>,
  <option key={7} value={"H"}>
    Flight H
  </option>
];

const attemptOptions = [
  <option key={1} value={"1"}>
    Attempt 1
  </option>,
  <option key={2} value={"2"}>
    Attempt 2
  </option>,
  <option key={3} value={"3"}>
    Attempt 3
  </option>,
  <option key={4} value={"4"}>
    Attempt 4
  </option>
];

class LiftingFooter extends React.Component {
  constructor(props) {
    super(props);

    this.dayOptions = [];
    for (let i = 1; i <= props.lengthDays; i++) {
      const label = "Day " + String(i);
      this.dayOptions.push(
        <option value={i} key={i}>
          {label}
        </option>
      );
    }

    this.handleDayChange = this.handleDayChange.bind(this);
    this.handlePlatformChange = this.handlePlatformChange.bind(this);
    this.handleFlightChange = this.handleFlightChange.bind(this);
    this.handleLiftChange = this.handleLiftChange.bind(this);

    this.handleAttemptChange = this.handleAttemptChange.bind(this);
    this.handleLifterChange = this.handleLifterChange.bind(this);
  }

  handleDayChange(event) {
    const day = Number(event.target.value);
    const platform = this.props.lifting.platform;
    const flight = this.props.lifting.flight;
    const lift = this.props.lifting.lift;
    this.props.setLiftingGroup(day, platform, flight, lift);
  }
  handlePlatformChange(event) {
    const day = this.props.lifting.day;
    const platform = Number(event.target.value);
    const flight = this.props.lifting.flight;
    const lift = this.props.lifting.lift;
    this.props.setLiftingGroup(day, platform, flight, lift);
  }
  handleFlightChange(event) {
    const day = this.props.lifting.day;
    const platform = this.props.lifting.platform;
    const flight = event.target.value;
    const lift = this.props.lifting.lift;
    this.props.setLiftingGroup(day, platform, flight, lift);
  }
  handleLiftChange(event) {
    const day = this.props.lifting.day;
    const platform = this.props.lifting.platform;
    const flight = this.props.lifting.flight;
    const lift = event.target.value;
    this.props.setLiftingGroup(day, platform, flight, lift);
  }

  handleAttemptChange(event) {
    const attempt = Number(event.target.value);
    this.props.overrideAttempt(attempt);
  }
  handleLifterChange(event) {
    const entryId = Number(event.target.value);
    this.props.overrideEntryId(entryId);
  }

  render() {
    const CURRENT_DAY_FIXME = 1;
    const numPlatforms = this.props.platformsOnDays[CURRENT_DAY_FIXME - 1];

    let platformOptions = [];
    for (let i = 1; i <= numPlatforms; i++) {
      platformOptions.push(
        <option value={i} key={i}>
          Platform {i}
        </option>
      );
    }

    const buttonStyle = {
      width: "200px",

      // Removing rounding allows the score table operator to mash "Good Lift"
      // by just moving the mouse into the lower-left corner of the screen.
      borderRadius: "0px"
    };
    const selectStyle = { width: "120px" };

    const rightControlsStyle = {
      display: "flex",
      alignItems: "center",
      paddingRight: "4px"
    };

    return (
      <div style={footerStyle}>
        <div>
          <Button bsStyle="success" bsSize="large" style={buttonStyle}>
            Good Lift
          </Button>
          <Button bsStyle="danger" bsSize="large" style={buttonStyle}>
            No Lift
          </Button>
        </div>

        <div style={rightControlsStyle}>
          <FormControl
            componentClass="select"
            defaultValue={this.props.lifting.day}
            onChange={this.handleDayChange}
            style={selectStyle}
          >
            {this.dayOptions}
          </FormControl>
          <FormControl
            componentClass="select"
            defaultValue={this.props.lifting.platform}
            onChange={this.handlePlatformChange}
            style={selectStyle}
          >
            {platformOptions}
          </FormControl>
          <FormControl
            componentClass="select"
            defaultValue={this.props.lifting.lift}
            onChange={this.handleLiftChange}
            style={selectStyle}
          >
            {liftOptions}
          </FormControl>
          <FormControl
            componentClass="select"
            defaultValue={this.props.lifting.flight}
            onChange={this.handleFlightChange}
            style={selectStyle}
          >
            {flightOptions}
          </FormControl>
          <FormControl componentClass="select" onChange={this.handleAttemptChange} style={selectStyle}>
            {attemptOptions}
          </FormControl>
          <FormControl componentClass="select" onChange={this.handleLifterChange} style={selectStyle}>
            <option key={0} value="5000">
              Unknown Lifter
            </option>
          </FormControl>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lengthDays: state.meet.lengthDays,
    platformsOnDays: state.meet.platformsOnDays,
    lifting: state.lifting
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLiftingGroup: (day, platform, flight, lift) => dispatch(setLiftingGroup(day, platform, flight, lift)),
    overrideAttempt: attempt => dispatch(overrideAttempt(attempt)),
    overrideEntryId: entryId => dispatch(overrideEntryId(entryId))
  };
};

LiftingFooter.propTypes = {
  lengthDays: PropTypes.number.isRequired,
  platformsOnDays: PropTypes.array.isRequired,
  lifting: PropTypes.shape({
    day: PropTypes.number.isRequired,
    platform: PropTypes.number.isRequired,
    flight: PropTypes.string.isRequired,
    lift: PropTypes.string.isRequired
  }).isRequired,
  setLiftingGroup: PropTypes.func.isRequired,
  overrideAttempt: PropTypes.func.isRequired,
  overrideEntryId: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LiftingFooter);
