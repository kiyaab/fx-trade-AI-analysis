from datetime import datetime
from typing import Dict, Any, List
import math
import numpy as np
import pandas as pd
from ..schemas import CandleSchema
from .technical_analysis import TechnicalAnalysisEngine

class FeatureEngineeringService:
    """
    Constructs leak-free feature vectors for Forex price prediction and regime classification.
    Strictly forbids forward-looking information.
    """

    @classmethod
    def extract_features_from_dataframe(cls, df: pd.DataFrame, spread_pips: float = 1.0) -> pd.DataFrame:
        if len(df) < 50:
            return pd.DataFrame()

        df_feat, _ = TechnicalAnalysisEngine.compute_all_indicators(df)
        close = df_feat["close"]
        high = df_feat["high"]
        low = df_feat["low"]
        vol = df_feat["volume"]

        # 1. Price Returns & Log Returns
        df_feat["ret_1"] = close.pct_change(1)
        df_feat["ret_3"] = close.pct_change(3)
        df_feat["ret_6"] = close.pct_change(6)
        df_feat["log_ret_1"] = np.log(close / close.shift(1))

        # 2. EMA Distances (Normalized % deviation)
        df_feat["dist_ema_9"] = (close - df_feat["ema_9"]) / (close + 1e-9)
        df_feat["dist_ema_21"] = (close - df_feat["ema_21"]) / (close + 1e-9)
        df_feat["dist_ema_50"] = (close - df_feat["ema_50"]) / (close + 1e-9)
        df_feat["dist_ema_200"] = (close - df_feat["ema_200"]) / (close + 1e-9)

        # 3. Normalized ATR & Volatility
        df_feat["norm_atr"] = df_feat["atr_14"] / (close + 1e-9)
        
        # 4. Normalized Momentum & Oscillators
        df_feat["norm_rsi"] = (df_feat["rsi_14"] - 50.0) / 50.0  # Range -1 to +1
        df_feat["norm_macd_hist"] = df_feat["macd_hist"] / (df_feat["atr_14"] + 1e-9)
        df_feat["norm_adx"] = df_feat["adx_14"] / 100.0

        # 5. Candle Geometry
        candle_body = (close - df_feat["open"]).abs()
        candle_range = (high - low).replace(0, 1e-9)
        df_feat["body_range_ratio"] = candle_body / candle_range
        df_feat["upper_wick_ratio"] = (high - df_feat[["open", "close"]].max(axis=1)) / candle_range
        df_feat["lower_wick_ratio"] = (df_feat[["open", "close"]].min(axis=1) - low) / candle_range

        # 6. Session & Time Cyclics
        timestamps = pd.to_datetime(df_feat["timestamp"])
        df_feat["hour_sin"] = np.sin(2 * np.pi * timestamps.dt.hour / 24.0)
        df_feat["hour_cos"] = np.cos(2 * np.pi * timestamps.dt.hour / 24.0)
        df_feat["day_of_week"] = timestamps.dt.dayofweek / 6.0  # 0 to 1

        # Trading Sessions indicator (London: 8-16 UTC, NY: 13-21 UTC, Tokyo: 0-9 UTC)
        df_feat["session_london"] = ((timestamps.dt.hour >= 8) & (timestamps.dt.hour <= 16)).astype(float)
        df_feat["session_ny"] = ((timestamps.dt.hour >= 13) & (timestamps.dt.hour <= 21)).astype(float)
        df_feat["session_tokyo"] = ((timestamps.dt.hour >= 0) & (timestamps.dt.hour <= 9)).astype(float)

        # 7. Spread & Volume ratio
        df_feat["norm_spread"] = (spread_pips * 0.0001) / (close + 1e-9)
        vol_sma = vol.rolling(20, min_periods=5).mean() + 1e-9
        df_feat["vol_ratio"] = vol / vol_sma

        # Clean NaN
        df_feat.bfill(inplace=True)
        df_feat.ffill(inplace=True)
        df_feat.fillna(0.0, inplace=True)

        return df_feat

    @classmethod
    def get_latest_feature_vector(cls, df: pd.DataFrame) -> Dict[str, float]:
        """Extracts single flat dictionary of features for the most recent closed candle."""
        feat_df = cls.extract_features_from_dataframe(df)
        if feat_df.empty:
            return {}
        
        last = feat_df.iloc[-1]
        keys = [
            "dist_ema_9", "dist_ema_21", "dist_ema_50", "dist_ema_200",
            "norm_rsi", "norm_macd_hist", "norm_adx", "norm_atr",
            "bb_pct_b", "bb_bandwidth", "roc_12", "ret_1", "ret_3",
            "body_range_ratio", "upper_wick_ratio", "lower_wick_ratio",
            "hour_sin", "hour_cos", "day_of_week", "vol_ratio"
        ]
        return {k: float(last.get(k, 0.0)) for k in keys}
