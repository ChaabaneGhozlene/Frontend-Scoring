import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { recordingsSaga } from '../features/recordings/Recordingssaga';
import { configurationSaga } from '../features/Configuration/Campagnes/ConfigurationCampagnessaga';
import { agentMailConfigSaga } from '../features/Configuration/AgentMailConfig/AgentMailConfigSaga';
import { agentTeamSaga } from '../features/Configuration/AgentTeamConfig/AgentTeamSaga';
import evaluationSaga from '../features/evaluation/Evaluationsaga';
import { usersSaga } from '../features/Users/usersaga';
import { evalSaga } from '../features/eval/Evalsaga';
import { statistiqueSaga } from '../features/statistique/Statistiquesaga';
import { dashboardBuilderSaga } from '../features/statistique/DashboardSaga';
 function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(recordingsSaga),

    fork(configurationSaga),
    fork(agentTeamSaga),   
    fork(agentMailConfigSaga),
    fork(evaluationSaga),
    fork(usersSaga),
    fork(evalSaga),
    fork(statistiqueSaga),
    fork(dashboardBuilderSaga),  // ← ajouter

  ]);
}
export default rootSaga;