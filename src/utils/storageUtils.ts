/**
 * 로컬 스토리지 관련 유틸리티 함수
 */

/**
 * 로컬 스토리지에 데이터 저장
 * @param key 저장 키
 * @param data 저장할 데이터
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save data to localStorage key ${key}:`, error);
  }
};

/**
 * 로컬 스토리지에서 데이터 로드
 * @param key 로드할 데이터의 키
 * @param defaultValue 데이터가 없을 경우 반환할 기본값
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const dataString = localStorage.getItem(key);
    return dataString ? JSON.parse(dataString) : defaultValue;
  } catch (error) {
    console.error(`Failed to load data from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * 로컬 스토리지에서 특정 키의 데이터 삭제
 * @param key 삭제할 데이터의 키
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data from localStorage key ${key}:`, error);
  }
};
