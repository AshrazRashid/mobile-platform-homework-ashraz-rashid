import { createNavigationContainerRef } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};

export const navigationRef = createNavigationContainerRef<RootTabParamList>();
