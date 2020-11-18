/*
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { useEffect, useRef } from 'react';
import { useOktaAuth } from './OktaContext';
import { Route, useRouteMatch as useRouteMatchOriginal, useLocation, matchPath } from 'react-router-dom';

// react-router v6 doesn't export useRouteMatch
// Issue: https://github.com/ReactTraining/react-router/issues/7133
// PR: https://github.com/ReactTraining/react-router/pull/7142
const useRouteMatchPolyfill = (pattern) => {
  const location = useLocation();
  return React.useMemo(() => 
    pattern.path ? matchPath(pattern, location.pathname) : null, 
    [location, pattern]
  );
};
const useRouteMatch = useRouteMatchOriginal || useRouteMatchPolyfill;

const SecureRoute = ( props ) => { 
  const { authService, authState } = useOktaAuth();
  const match = useRouteMatch(props);
  const pendingLogin = useRef(false);

  useEffect(() => {
    // Only process logic if the route matches
    if (!match) {
      return;
    }

    if (authState.isAuthenticated) {
      pendingLogin.current = false;
      return;
    }

    // Start login if app has decided it is not logged in and there is no pending signin
    if(!authState.isAuthenticated && !authState.isPending && !pendingLogin.current) { 
      pendingLogin.current = true;
      authService.login();
    }
  }, [authState.isPending, authState.isAuthenticated, authService, match]);

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Route
      { ...props }
    />
  );
};

export default SecureRoute;
