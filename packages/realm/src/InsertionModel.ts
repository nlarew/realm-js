////////////////////////////////////////////////////////////////////////////
//
// Copyright 2022 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// Copyright 2022 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import { Collection } from "./Collection";
import { Dictionary } from "./Dictionary";
import { List } from "./List";
import { Object as RealmObject } from "./Object";

type ExtractPropertyNamesOfType<T, PropType> = {
  [K in keyof T]: T[K] extends PropType ? K : never;
}[keyof T];

/**
 * Exchanges properties defined as Realm.List<Model> with an optional Array<Model | RealmInsertionModel<Model>>.
 */
type RealmListsRemappedModelPart<T> = {
  [K in ExtractPropertyNamesOfType<T, List>]?: T[K] extends List<infer GT>
    ? Array<GT | RealmInsertionModel<GT>>
    : never;
};

/**
 * Exchanges properties defined as Realm.Dicionary<Model> with an optional key to mixed value object.
 */
type RealmDictionaryRemappedModelPart<T> = {
  [K in ExtractPropertyNamesOfType<T, Dictionary>]?: T[K] extends Dictionary<infer ValueType>
    ? { [key: string]: ValueType }
    : never;
};

/** Omits all properties of a model which are not defined by the schema */
type OmittedRealmTypes<T> = Omit<
  T,
  | keyof RealmObject
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  | ExtractPropertyNamesOfType<T, Function> // TODO: Figure out the use-case for this
  | ExtractPropertyNamesOfType<T, Collection>
  | ExtractPropertyNamesOfType<T, Dictionary>
>;

/** Remaps realm types to "simpler" types (arrays and objects) */
type RemappedRealmTypes<T> = RealmListsRemappedModelPart<T> & RealmDictionaryRemappedModelPart<T>;

/**
 * Joins T stripped of all keys which value extends Realm.Collection and all inherited from Realm.Object,
 * with only the keys which value extends Realm.List, remapped as Arrays.
 */
export type RealmInsertionModel<T> = OmittedRealmTypes<T> & RemappedRealmTypes<T>;
