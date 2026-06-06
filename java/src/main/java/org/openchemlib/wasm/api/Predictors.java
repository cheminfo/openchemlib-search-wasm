package org.openchemlib.wasm.api;

import com.actelion.research.chem.prediction.ParameterizedStringList;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSArray;
import org.teavm.jso.core.JSObjects;

/**
 * Shared helpers for the predictor facades. Converts OCL
 * {@link ParameterizedStringList} detail into a JS array of
 * {@code { type: number, value: string }} objects.
 */
final class Predictors {
  private Predictors() {}

  /** A single detail entry returned to JS, with a numeric type and string value. */
  interface Detail extends JSObject {
    @JSProperty
    void setType(int value);

    @JSProperty
    void setValue(String value);
  }

  /**
   * Converts a {@link ParameterizedStringList} into a JS array of detail objects.
   *
   * @param list the parameterized string list
   * @return a JS array of {@code { type, value }} objects
   */
  static JSArray<Detail> convertParameterizedStringList(ParameterizedStringList list) {
    int size = list.getSize();
    JSArray<Detail> array = JSArray.create(size);
    for (int i = 0; i < size; i++) {
      Detail detail = JSObjects.create().cast();
      detail.setType(list.getStringTypeAt(i));
      detail.setValue(list.getStringAt(i));
      array.set(i, detail);
    }
    return array;
  }
}
