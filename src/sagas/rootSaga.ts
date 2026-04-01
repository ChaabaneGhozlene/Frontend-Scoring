import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { recordingsSaga } from '../features/recordings/Recordingssaga';
import { configurationSaga } from '../features/Configuration/Campagnes/ConfigurationCampagnessaga';
import { agentMailConfigSaga } from '../features/Configuration/AgentMailConfig/AgentMailConfigSaga';
import { agentTeamSaga } from '../features/Configuration/AgentTeamConfig/AgentTeamSaga';
 function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(recordingsSaga),

    fork(configurationSaga),
    fork(agentTeamSaga),   
    fork(agentMailConfigSaga),

  ]);
}
export default rootSaga;