import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEmpty } from 'lodash';

import TopBar from './TopBar';
import Map from './Map';
import TeamPanel from './TeamPanel';
import BottomBar from './BottomBar';
import * as mapActions from '../actions/mapActions';
import { getPlayers, getCurrentCityId } from '../selectors';


class Game extends React.Component {
  constructor(props) {
    super(props);

    ['onCityClicked', 'onCityDoubleClicked'].forEach((meth) => {
      this[meth] = this[meth].bind(this);
    });
  }

  doMovePlayer(destinationId, source) {
    const { playerToMove } = this.props.currentMove;
    let playerId, originId;
    if (playerToMove) {
      playerId = playerToMove;
      originId = find(this.props.players, { id: playerId });
    } else {
      playerId = this.props.currentPlayerId;
      originId = this.props.currentCityId;
    }

    this.refs.map.getWrappedInstance().transitionPlayerMove(playerId, destinationId);
    this.props.actions.moveToCity(
      playerId,
      originId,
      destinationId,
      source);
  }

  onCityClicked(id) {
    const { availableCities, airlift, govGrantCities } = this.props.currentMove;
    if (!isEmpty(availableCities)) {
      const { source } = availableCities[id];
      this.doMovePlayer(id, source);
    } else if (!isEmpty(govGrantCities)) {
      this.props.actions.govGrantBuildStation(id);
    } else if (!isEmpty(airlift) && !isEmpty(airlift.cities)) {
      this.refs.map.getWrappedInstance().transitionPlayerMove(airlift.playerId, id);
      this.props.actions.airliftMoveToCity(airlift.playerId, id);
    }
  }

  onCityDoubleClicked(id) {
    this.doMovePlayer(id, 'drive');
  }


  render() {
    return (
      <div className="game">
        <TopBar />
        <TeamPanel />
        <BottomBar />
        <Map
          ref="map"
          onCityClicked={this.onCityClicked}
          onCityDoubleClicked={this.onCityDoubleClicked} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentMove: state.currentMove,
  players: getPlayers(state),
  currentPlayerId: state.currentMove.player,
  currentCityId: getCurrentCityId(state)
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Object.assign({}, mapActions), dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);